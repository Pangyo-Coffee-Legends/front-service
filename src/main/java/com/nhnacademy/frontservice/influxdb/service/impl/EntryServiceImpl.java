package com.nhnacademy.frontservice.influxdb.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.QueryApi;
import com.influxdb.query.FluxRecord;
import com.influxdb.query.FluxTable;
import com.nhnacademy.frontservice.influxdb.EntryCountDto;
import com.nhnacademy.frontservice.influxdb.service.EntryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * InfluxDB에서 출입 데이터(센서 데이터)를 조회하여
 * 일별 출입 횟수를 반환하는 서비스 클래스입니다.
 *
 * <p>이 서비스는 InfluxDBClient를 통해 Flux 쿼리를 실행하고,
 * 응답 결과를 List 형태로 가공하여 반환합니다.</p>
 */
@Slf4j
@Service
public class EntryServiceImpl implements EntryService {
    private final InfluxDBClient influxDBClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public EntryServiceImpl(InfluxDBClient influxDBClient) {
        this.influxDBClient = influxDBClient;
    }

    /**
     * InfluxDB에 저장된 센서 데이터를 조회하여
     * 최근 30일간의 일별 출입 횟수를 가져옵니다.
     *
     * <p>Flux 쿼리를 통해 '입구' 위치의 'activity(인원이 지나간 횟수)' 타입 센서 값을 집계하여,
     * 날짜별 출입 횟수를 계산합니다.</p>
     * 쿼리문 속 range는 해당 데이터 기간설정
     * aggregateWindow 속 every 뒤엔 받아올 시간 및 월별 단위 작성
     * @return 날짜와 해당 날짜의 출입 횟수를 담은 EntryCountDto 객체 리스트
     */
    @Override
    public List<EntryCountDto> getMonthlyEntryCounts() {
        String flux = "from(bucket: \"coffee-mqtt\")\n" +
                "  |> range(start: -7d)\n" +
                "  |> filter(fn: (r) => r[\"_measurement\"] == \"sensor\")\n" +
                "  |> filter(fn: (r) => r[\"_field\"] == \"value\")\n" +
                "  |> filter(fn: (r) => r[\"location\"] == \"입구\")\n" +
                "  |> filter(fn: (r) => r[\"type\"] == \"activity\")\n" +
                "  |> aggregateWindow(every: 24h, fn: count, createEmpty: true)\n" +
                "  |> yield(name: \"mean\")";

        QueryApi queryApi = influxDBClient.getQueryApi();
        List<FluxTable> tables = queryApi.query(flux);
        List<EntryCountDto> result = new ArrayList<>();

        for (FluxTable table : tables) {
            for (FluxRecord record : table.getRecords()) {
                String date = Objects.requireNonNull(record.getTime()).toString().substring(0, 10);
                int count = ((Number) Objects.requireNonNull(record.getValue())).intValue();
                EntryCountDto dto = new EntryCountDto(date, count);

                try {
                    String json = objectMapper.writeValueAsString(dto);
                    log.info("[Influx Entry] {}", json);
                } catch (JsonProcessingException e) {
                    log.error("[Influx Entry] JSON 직렬화 실패", e);
                }

                result.add(dto);
            }
        }

        return result;
    }
}
