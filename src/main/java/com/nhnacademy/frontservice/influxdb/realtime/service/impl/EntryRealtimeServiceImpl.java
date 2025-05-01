package com.nhnacademy.frontservice.influxdb.realtime.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.QueryApi;
import com.influxdb.query.FluxRecord;
import com.influxdb.query.FluxTable;
import com.nhnacademy.frontservice.influxdb.realtime.dto.EntryRealtimeDto;
import com.nhnacademy.frontservice.influxdb.realtime.service.EntryRealtimeService;
import com.nhnacademy.frontservice.log.LogWebSocketHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;

/**
 * InfluxDB에서 최근 하루 데이터를 조회하여
 * 실시간 출입 통계를 반환하는 서비스 클래스입니다.
 */
@Slf4j
@Service
public class EntryRealtimeServiceImpl implements EntryRealtimeService {

    private final InfluxDBClient influxDBClient;
    private final LogWebSocketHandler logWebSocketHandler;
    private final ObjectMapper objectMapper;
    private final EmailServiceImpl emailService;

    public EntryRealtimeServiceImpl(InfluxDBClient influxDBClient, LogWebSocketHandler logWebSocketHandler, ObjectMapper objectMapper, EmailServiceImpl emailService) {
        this.influxDBClient = influxDBClient;
        this.logWebSocketHandler = logWebSocketHandler;
        this.objectMapper = objectMapper;
        this.emailService = emailService;
    }

    /**
     * 최근 24시간 이내의 출입 데이터를 1분 간격으로 집계합니다.
     *
     * @return EntryRealtimeDto 객체 (가장 최근 시간의 데이터)
     */
    @Scheduled(fixedRate = 30000) // 30초마다 실행
    @Override
    public EntryRealtimeDto getLatestEntry() {
        String flux = """
                        from(bucket: "coffee-mqtt")
                          |> range(start: -1d)
                          |> filter(fn: (r) => r["_measurement"] == "sensor")
                          |> filter(fn: (r) => r["_field"] == "value")
                          |> filter(fn: (r) => r["location"] == "입구")
                          |> filter(fn: (r) => r["type"] == "activity")
                          |> aggregateWindow(every: 1m, fn: count, createEmpty: true)
                          |> sort(columns: ["_time"], desc: true)
                          |> limit(n: 1)
                      """;

        QueryApi queryApi = influxDBClient.getQueryApi();
        List<FluxTable> tables = queryApi.query(flux);

        for (FluxTable table : tables) {
            for (FluxRecord record : table.getRecords()) {
                LocalDateTime entryTime = Objects.requireNonNull(record.getTime()).atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime();

                String time = Objects.requireNonNull(record.getTime()).toString().replace("T", " ").substring(0, 16);

                int count = ((Number) Objects.requireNonNull(record.getValue())).intValue();

                EntryRealtimeDto dto = new EntryRealtimeDto(time, count);

                logAndBroadcast(dto, entryTime);

                return dto;
            }
        }

        String fallbackMessage = "[WARN] 실시간 출입 데이터가 존재하지 않습니다.";
        log.warn(fallbackMessage);
        logWebSocketHandler.broadcast(fallbackMessage);

        return new EntryRealtimeDto("N/A", 0);
    }

    /**
     * 특정 시간이 심야(23시~5시)인지 여부를 판단합니다.
     */
    boolean isInTargetTime(LocalDateTime time) {
        int hour = time.getHour();
        return hour == 23 || hour < 5;
    }

    /**
     * 실시간 출입 데이터에 대한 로그를 기록하고 WebSocket을 통해 브로드캐스트합니다.
     * <p>
     * - 심야 시간대(entryTime이 지정된 범위 내)에는 경고(ALERT) 레벨로 로그를 남기고,
     * - 일반 시간대에는 정보(INFO) 레벨로 로그를 남깁니다.
     * <p>
     * 또한, 데이터 직렬화 실패 시 에러 로그를 출력하고 에러 메시지를 WebSocket으로 전송합니다.
     *
     * @param dto       출입 정보를 담은 DTO 객체 (시간, 출입자 수)
     * @param entryTime 출입이 감지된 시간 (심야 여부 판단에 사용)
     */
    void logAndBroadcast(EntryRealtimeDto dto, LocalDateTime entryTime) {
        try {
            String json = objectMapper.writeValueAsString(dto);

            boolean isNight = isInTargetTime(entryTime);

            // 메시지 라벨 및 내용 분리
            String logLevel = isNight ? "ALERT" : "INFO";
            String messagePrefix = isNight ? "이상 출입자 발생" : "실시간 출입 데이터";

            String message = String.format("[%s] %s | 시간: %s | 출입자 수: %d",
                    logLevel, messagePrefix, dto.getTime(), dto.getCount());

            String fullMessage = message + " | 데이터: " + json;

            // 로그 출력
            if (isNight) {
                emailService.sendIntrusionAlertToAdmin(
                        "kim5472678@gmail.com",
                        "⚠️ 이상 출입 감지 알림",
                        dto.getTime()+"\n이상 출입자 발생.\n관리자 확인 바랍니다."
                );
                log.error(fullMessage);
            } else {
                log.info(fullMessage);
            }

            // WebSocket 방송
            logWebSocketHandler.broadcast(fullMessage);

        }  catch (JsonProcessingException e) {
            String errorMessage = "[ERROR] JSON 직렬화 실패: 실시간 출입 데이터 로그 전송 중 예외 발생";
            log.error(errorMessage, e);
            logWebSocketHandler.broadcast(errorMessage + " - " + e.getMessage());
        }
    }

}