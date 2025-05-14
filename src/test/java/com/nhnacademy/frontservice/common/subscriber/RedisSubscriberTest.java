package com.nhnacademy.frontservice.common.subscriber;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.nhnacademy.frontservice.dto.action.ActionResult;
import com.nhnacademy.frontservice.dto.condition.ConditionResult;
import com.nhnacademy.frontservice.dto.rule.RuleEvaluationResult;
import com.nhnacademy.frontservice.dto.sensor.SensorResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.redis.connection.Message;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class RedisSubscriberTest {

    private RedisSubscriber redisSubscriber;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        redisSubscriber = new RedisSubscriber(objectMapper);
    }

    @Test
    @DisplayName("테스트용 센서 결과")
    void onMessage_shouldDeserializeSensorResult() throws Exception {
        // 테스트용 SensorResult 생성
        LocalDateTime now = LocalDateTime.now();

        ConditionResult condition = new ConditionResult(1L, "temperature", "LT", "25", true);
        ActionResult action = new ActionResult(100L, true, "COMFORT_NOTIFICATION", "{\"message\":\"온도가 높습니다!\"}", null, now);
        RuleEvaluationResult ruleResult = new RuleEvaluationResult(1L, "온도 규칙", true, List.of(condition), List.of(action), "규칙 통과", now);
        SensorResult sensorResult = new SensorResult("Sensor-01", "Room-101", "ON", List.of(ruleResult));

        // JSON 직렬화
        String json = objectMapper.writeValueAsString(sensorResult);

        // Message 모킹
        Message message = Mockito.mock(Message.class);
        when(message.getBody()).thenReturn(json.getBytes(StandardCharsets.UTF_8));

        // RedisSubscriber에 수신 객체 저장용 필드가 있다고 가정
        // (없다면 onMessage에서 임시로 필드에 저장하도록 구현 필요)
        redisSubscriber.onMessage(message, null);

        // 예시: getLastReceived()로 마지막 수신 객체를 가져온다고 가정
        SensorResult received = redisSubscriber.getLastReceived();
        assertNotNull(received);
        assertEquals("Sensor-01", received.getSensorName());
        assertEquals("Room-101", received.getLocation());
        assertEquals("ON", received.getStatus());
        assertEquals(1, received.getRuleResults().size());
    }

}