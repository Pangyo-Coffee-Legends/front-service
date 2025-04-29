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
 * InfluxDB에서 최근 하루 데이터를 조회하여
 * 실시간 출입 통계를 반환하는 서비스 클래스입니다.
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
     * 최근 24시간 이내의 출입 데이터를 1분 간격으로 집계합니다.
     *
     * @return EntryRealtimeDto 객체 (가장 최근 시간의 데이터)
     */
    @Override
    public EntryRealtimeDto getLatestEntry() {
        System.out.println("메서드 진입!");
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

        log.info("tables size: {}", tables.size());
        for (FluxTable table : tables) {
            for (FluxRecord record : table.getRecords()) {
                //테스트 다 하고 나면 이걸로 되돌리기
//                OffsetDateTime offsetDateTime = OffsetDateTime.from(record.getTime());
//                LocalDateTime entryTime = offsetDateTime.toLocalDateTime();
                LocalDateTime entryTime = LocalDateTime.of(2024, 4, 29, 1, 30);

                String time = entryTime.toString().replace("T", " ").substring(0, 16);
                //테스트 다하면 65번 -> 67번으로 돌리기
//                String time = Objects.requireNonNull(record.getTime()).toString().replace("T", " ").substring(0, 16);
                int count = ((Number) Objects.requireNonNull(record.getValue())).intValue();

                // 사람이 없으면 강제로 count를 1로 만들어 테스트
                if (count == 0) {
                    count = 1;
                }

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
     * 특정 시간이 심야(23시~5시)인지 여부를 판단합니다.
     */
    private boolean isInTargetTime(LocalDateTime time) {
        int hour = time.getHour();
        return (hour >= 23 || hour < 5);
    }
}