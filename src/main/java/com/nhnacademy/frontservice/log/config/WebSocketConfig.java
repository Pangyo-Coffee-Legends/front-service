package com.nhnacademy.frontservice.log.config;

import com.nhnacademy.frontservice.log.realtime.LogWebSocketHandler;
import com.nhnacademy.frontservice.log.realtime.WebSocketContextHolder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * 로그 전용 WebSocket 설정 클래스입니다.
 * <p>
 * 이 클래스는 로그 스트리밍 처리를 위한 WebSocket 핸들러를 등록하며,
 * 클라이언트는 /ws/logs 경로를 통해 로그를 실시간으로 수신할 수 있습니다.
 * </p>
 *
 * <ul>
 *     <li><b>핸들러 등록:</b> LogWebSocketHandler를 /ws/logs에 바인딩</li>
 *     <li><b>Context 등록:</b> WebSocketContextHolder에 핸들러 설정</li>
 *     <li><b>CORS 설정:</b> 모든 Origin 허용</li>
 * </ul>
 *
 * @author nhnacademy
 */
@Slf4j
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final LogWebSocketHandler logWebSocketHandler;

    /**
     * WebSocket 설정 클래스 생성자입니다.
     * <p>
     * 생성 시 로그 스트리밍용 WebSocket 핸들러를 전달받고,
     * {@link WebSocketContextHolder}를 통해 전역 설정에 등록합니다.
     * </p>
     *
     * @param logWebSocketHandler 로그 데이터를 처리할 WebSocket 핸들러
     */
    public WebSocketConfig(LogWebSocketHandler logWebSocketHandler) {
        this.logWebSocketHandler = logWebSocketHandler;
        WebSocketContextHolder.setHandler(logWebSocketHandler);
        log.info("[WebSocketConfig] WebSocket 핸들러 설정 완료");
    }

    /**
     * WebSocket 핸들러를 경로에 등록합니다.
     * <p>
     * 클라이언트는 지정된 경로를 통해 WebSocket에 연결할 수 있으며,
     * Cross-Origin 요청도 허용됩니다.
     * </p>
     *
     * @param registry WebSocket 핸들러 등록 객체
     */
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(logWebSocketHandler, "/ws/logs", "/ws/stranger", "/ws/sensor")
                .setAllowedOrigins("*");  // CORS: 모든 도메인 허용
        log.info("[WebSocketConfig] WebSocket 경로 등록 완료: /ws/logs");
        log.info("[WebSocketConfig] WebSocket 경로 등록 완료: /ws/stranger");
        log.info("[WebSocketConfig] WebSocket 경로 등록 완료: /ws/sensor");
    }
}
