package com.nhnacademy.frontservice.common.subscriber;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhnacademy.frontservice.dto.sensor.SensorResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class RedisSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private SensorResult lastReceived;

    public RedisSubscriber(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            // 메시지 역직렬화
            lastReceived = objectMapper.readValue(message.getBody(), SensorResult.class);
            log.info("프론트 서비스에서 받은 센서 데이터: {}", lastReceived);
            // 필요하다면 WebSocket 등으로 브로드캐스트
        } catch (Exception e) {
            log.error("Redis 구독 에러", e);
        }
    }

    // 테스트용 메서드
    public SensorResult getLastReceived() {
        return lastReceived;
    }
}
