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

        // 5. 실행
        EntryRealtimeDto result = service.getLatestEntry();

        // 6. 검증
        verify(logWebSocketHandler).broadcast(contains("INFO"));
        assertEquals(3, result.getCount());
    }

    @Test
    void getLatestEntry() {

        EntryRealtimeDto dto = new EntryRealtimeDto("2025-04-29 00:01", 3);
        LocalDateTime midnight = LocalDateTime.of(2025, 4, 29, 0, 1);

        service.logAndBroadcast(dto, midnight);

        verify(logWebSocketHandler).broadcast(contains("ALERT"));

    }

    @Test
    void testLogAndBroadcast_atAfternoon_logsAsInfo() {
        EntryRealtimeDto dto = new EntryRealtimeDto("2025-04-29 14:00", 5);
        LocalDateTime afternoon = LocalDateTime.of(2025, 4, 29, 14, 0);

        service.logAndBroadcast(dto, afternoon);

        verify(logWebSocketHandler).broadcast(contains("INFO"));
    }

    @Test
    void testLogAndBroadcast_jsonSerializationFails_logsError() throws JsonProcessingException {
        EntryRealtimeDto dto = new EntryRealtimeDto("2025-04-29 01:00", 1);
        LocalDateTime time = LocalDateTime.of(2025, 4, 29, 1, 0);

        // ObjectMapper의 writeValueAsString을 강제로 실패시키기
        doThrow(new JsonProcessingException("Mock Failure") {})
                .when(objectMapper).writeValueAsString(dto);

        service.logAndBroadcast(dto, time);

        verify(logWebSocketHandler).broadcast(contains("직렬화 실패"));
    }


}