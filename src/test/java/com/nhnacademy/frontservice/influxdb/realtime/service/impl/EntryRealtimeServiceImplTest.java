package com.nhnacademy.frontservice.influxdb.realtime.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.influxdb.client.InfluxDBClient;
import com.nhnacademy.frontservice.influxdb.realtime.dto.EntryRealtimeDto;
import com.nhnacademy.frontservice.log.LogWebSocketHandler;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

@SpringBootTest
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
        // given
        EntryRealtimeDto dto = mock(EntryRealtimeDto.class);
        LocalDateTime time = LocalDateTime.of(2025, 4, 29, 1, 0);

        EntryRealtimeServiceImpl faultyService = new EntryRealtimeServiceImpl(influxDBClient, logWebSocketHandler) {
            @Override
            void logAndBroadcast(EntryRealtimeDto dto, LocalDateTime entryTime) {
                try {
                    throw new JsonProcessingException("Mock Failure") {};
                } catch (JsonProcessingException e) {
                    String errorMessage = "[ERROR] JSON 직렬화 실패: 실시간 출입 데이터 로그 전송 중 예외 발생";
                    logWebSocketHandler.broadcast(errorMessage + " - " + e.getMessage());
                }
            }
        };

        // when
        faultyService.logAndBroadcast(dto, time);

        // then
        verify(logWebSocketHandler).broadcast(contains("직렬화 실패"));
    }


}