package com.nhnacademy.frontservice.log;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket 설정 클래스입니다.
 * WebSocket 핸들러 등록과 경로를 설정합니다.
 */
@Slf4j
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final LogWebSocketHandler logWebSocketHandler;

    /**
     * 생성자를 통해 WebSocket 핸들러를 설정하고 전역 Context에 등록합니다.
     *
     * @param logWebSocketHandler 로그 WebSocket 핸들러
     */
    public WebSocketConfig(LogWebSocketHandler logWebSocketHandler) {
        this.logWebSocketHandler = logWebSocketHandler;
        WebSocketContextHolder.setHandler(logWebSocketHandler);
        log.info("[WebSocketConfig] WebSocket 핸들러 설정 완료");
    }

    /**
     * WebSocket 핸들러를 지정된 경로에 등록합니다.
     *
     * @param registry WebSocket 핸들러 등록 객체
     */
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        log.info("[WebSocketConfig] WebSocket 경로 등록: /ws/logs");
        registry.addHandler(logWebSocketHandler, "/ws/logs").setAllowedOrigins("*");
    }
}
