package com.nhnacademy.frontservice.influxdb.realtime.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.QueryApi;
import com.influxdb.query.FluxRecord;
import com.influxdb.query.FluxTable;
import com.nhnacademy.frontservice.influxdb.realtime.dto.EntryRealtimeDto;
import com.nhnacademy.frontservice.log.LogWebSocketHandler;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.*;

/**
 * {@link EntryRealtimeServiceImpl} 클래스의 단위 테스트 클래스입니다.
 * InfluxDB에서 가져온 출입 데이터의 처리 및 WebSocket 로그 전송 기능을 검증합니다.
 */
@ExtendWith(MockitoExtension.class)
class EntryRealtimeServiceImplTest {

    @Mock
    InfluxDBClient influxDBClient;

    @Mock
    LogWebSocketHandler logWebSocketHandler;

    @InjectMocks
    EntryRealtimeServiceImpl service;

    @Spy
    ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 정상적인 InfluxDB 응답이 있을 때 logWebSocketHandler가 "INFO" 로그를 broadcast 하는지 검증합니다.
     */
    @Test
    void testGetLatestEntry_withValidData_broadcastsInfo() {
        QueryApi mockQueryApi = mock(QueryApi.class);
        FluxRecord mockRecord = mock(FluxRecord.class);
        FluxTable mockTable = mock(FluxTable.class);

        when(influxDBClient.getQueryApi()).thenReturn(mockQueryApi);
        when(mockQueryApi.query(anyString())).thenReturn(List.of(mockTable));
        when(mockTable.getRecords()).thenReturn(List.of(mockRecord));

        OffsetDateTime fakeTime = OffsetDateTime.now().withHour(14);
        when(mockRecord.getTime()).thenReturn(fakeTime.toInstant());
        when(mockRecord.getValue()).thenReturn(3);

        EntryRealtimeDto result = service.getLatestEntry();

        verify(logWebSocketHandler).broadcast(contains("INFO"));
        assertEquals(3, result.getCount());
    }

    /**
     * 오전 시간일 경우 로그 레벨이 "ALERT"로 처리되는지 검증합니다.
     */
    @Test
    void getLatestEntry() {
        EntryRealtimeDto dto = new EntryRealtimeDto("2025-04-29 00:01", 3);
        LocalDateTime midnight = LocalDateTime.of(2025, 4, 29, 0, 1);

        service.logAndBroadcast(dto, midnight);

        verify(logWebSocketHandler).broadcast(contains("ALERT"));
    }

    /**
     * 오후 시간일 경우 로그 레벨이 "INFO"로 처리되는지 검증합니다.
     */
    @Test
    void testLogAndBroadcast_atAfternoon_logsAsInfo() {
        EntryRealtimeDto dto = new EntryRealtimeDto("2025-04-29 14:00", 5);
        LocalDateTime afternoon = LocalDateTime.of(2025, 4, 29, 14, 0);

        service.logAndBroadcast(dto, afternoon);

        verify(logWebSocketHandler).broadcast(contains("INFO"));
    }

    /**
     * JSON 직렬화 실패 상황을 강제로 발생시켜 로그 메시지가 "직렬화 실패"로 출력되는지 검증합니다.
     *
     * @throws JsonProcessingException 직렬화 실패를 강제로 유발하기 위해 선언된 예외
     */
    @Test
    void testLogAndBroadcast_jsonSerializationFails_logsError() throws JsonProcessingException {
        EntryRealtimeDto dto = new EntryRealtimeDto("2025-04-29 01:00", 1);
        LocalDateTime time = LocalDateTime.of(2025, 4, 29, 1, 0);

        doThrow(new JsonProcessingException("Mock Failure") {})
                .when(objectMapper).writeValueAsString(dto);

        service.logAndBroadcast(dto, time);

        verify(logWebSocketHandler).broadcast(contains("직렬화 실패"));
    }
}