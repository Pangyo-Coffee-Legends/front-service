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
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;

/**
 * InfluxDB에서 최근 24시간 이내 출입 데이터를 조회하고,
 * 1분 간격으로 집계된 최신 출입 통계를 반환하는 서비스 클래스입니다.
 * <p>
 * 심야 시간대(23시 ~ 익일 5시) 출입이 감지될 경우,
 * 관리자에게 경고 메시지를 WebSocket을 통해 전송하고 에러 로그를 기록합니다.
 * 일반 시간대에는 출입 정보를 정보 로그로 기록하고 WebSocket을 통해 전송합니다.
 * </p>
 */
@Slf4j
@Service
public class EntryRealtimeServiceImpl implements EntryRealtimeService {

    private final InfluxDBClient influxDBClient;
    private final LogWebSocketHandler logWebSocketHandler;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public EntryRealtimeServiceImpl(InfluxDBClient influxDBClient, LogWebSocketHandler logWebSocketHandler) {
        this.influxDBClient = influxDBClient;
        this.logWebSocketHandler = logWebSocketHandler;
    }

    /**
     * 최근 24시간 이내의 출입 데이터를 1분 간격으로 집계하여 가장 최근 데이터를 조회합니다.
     * <p>
     * 심야 시간대(23시 ~ 5시) 출입이 발생하면 에러 로그를 남기고,
     * WebSocket을 통해 관리자에게 실시간 알림을 전송합니다.
     * 일반 시간대 출입은 정보 로그로 기록하고 알림을 전송합니다.
     * 출입 데이터가 없는 경우 경고 로그를 기록하고 기본 데이터를 반환합니다.
     * </p>
     *
     * @return 최근 출입 정보를 담은 {@link EntryRealtimeDto} 객체. 데이터가 없으면 시간은 "N/A", 출입자 수는 0으로 반환됩니다.
     */
    @Override
    public EntryRealtimeDto getLatestEntry() {
        String flux = "from(bucket: \"coffee-mqtt\")\n" +
                "  |> range(start: -1d)\n" +
                "  |> filter(fn: (r) => r[\"_measurement\"] == \"sensor\")\n" +
                "  |> filter(fn: (r) => r[\"_field\"] == \"value\")\n" +
                "  |> filter(fn: (r) => r[\"location\"] == \"입구\")\n" +
                "  |> filter(fn: (r) => r[\"type\"] == \"activity\")\n" +
                "  |> aggregateWindow(every: 1m, fn: count, createEmpty: true)\n" +
                "  |> sort(columns:[\"_time\"], desc:true)\n" +
                "  |> limit(n:1)";

        QueryApi queryApi = influxDBClient.getQueryApi();
        List<FluxTable> tables = queryApi.query(flux);

        for (FluxTable table : tables) {
            for (FluxRecord record : table.getRecords()) {
                OffsetDateTime offsetDateTime = OffsetDateTime.from(record.getTime());
                LocalDateTime entryTime = offsetDateTime.toLocalDateTime();

                String time = Objects.requireNonNull(record.getTime()).toString().replace("T", " ").substring(0, 16);

                int count = ((Number) Objects.requireNonNull(record.getValue())).intValue();

                EntryRealtimeDto dto = new EntryRealtimeDto(time, count);

                try {
                    String json = objectMapper.writeValueAsString(dto);

                    if(isInTargetTime(entryTime)){
                        //심야 시간대면 error 로그
                        String alertMessage = String.format("[ALERT] 심야 시간 출입 감지! | 시간: %s | 감지된 출입 수: %d", time, count);

                        log.error(alertMessage);

                        logWebSocketHandler.broadcast(alertMessage);
                    } else {
                        String message = String.format("[INFO] 실시간 출입 데이터 수신 | 시간: %s | 출입자 수: %d", time, count);

                        // 로그 출력
                        log.info(message);

                        // WebSocket 전송
                        logWebSocketHandler.broadcast(message);
                    }

                } catch (JsonProcessingException e) {
                    String errorMessage = "[ERROR] JSON 직렬화 실패: 실시간 출입 데이터 로그 전송 중 예외 발생";
                    log.error(errorMessage, e);
                    logWebSocketHandler.broadcast(errorMessage + " - " + e.getMessage());
                }

                return dto;
            }
        }

        String fallbackMessage = "[WARN] 실시간 출입 데이터가 존재하지 않습니다.";
        log.warn(fallbackMessage);
        logWebSocketHandler.broadcast(fallbackMessage);

        return new EntryRealtimeDto("N/A", 0);
    }

    /**
     * 주어진 시간이 심야 시간대(23시 ~ 5시)에 해당하는지 판단합니다.
     *
     * @param time 판단할 시간 (LocalDateTime)
     * @return 심야 시간대이면 {@code true}, 그렇지 않으면 {@code false}
     */
    private boolean isInTargetTime(LocalDateTime time) {
        int hour = time.getHour();
        return (hour == 23 || hour < 5);
    }
}