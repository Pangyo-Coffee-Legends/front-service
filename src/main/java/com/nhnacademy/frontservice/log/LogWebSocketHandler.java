package com.nhnacademy.frontservice.log;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket을 통해 클라이언트에게 로그 메시지를 실시간으로 전달하는 핸들러입니다.
 */
@Slf4j
@Component
public class LogWebSocketHandler implements WebSocketHandler {

    private final Set<WebSocketSession> sessions = Collections.synchronizedSet(new HashSet<>());
    private final Map<WebSocketSession, Object> sessionLocks = new ConcurrentHashMap<>();


    /**
     * 클라이언트와 연결이 수립되었을 때 호출됩니다.
     *
     * @param session WebSocket 세션 객체
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        log.info("[LogWebSocketHandler] 클라이언트 연결됨: {}", session.getId());
    }

    /**
     * 클라이언트로부터 메시지를 수신했을 때 호출됩니다. (현재는 미사용)
     *
     * @param session WebSocket 세션 객체
     * @param message 수신된 메시지
     */
    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) {
        log.debug("[LogWebSocketHandler] 메시지 수신 (미사용): {}", message.getPayload());
    }

    /**
     * 클라이언트와의 전송 중 오류가 발생했을 때 호출됩니다.
     *
     * @param session   WebSocket 세션 객체
     * @param exception 발생한 예외
     */
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        sessions.remove(session);
        log.error("[LogWebSocketHandler] 전송 오류 발생: {}", session.getId(), exception);
    }

    /**
     * 클라이언트 연결이 종료되었을 때 호출됩니다.
     *
     * @param session     WebSocket 세션 객체
     * @param closeStatus 종료 상태 정보
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) {
        sessions.remove(session);
        log.info("[LogWebSocketHandler] 연결 종료: {} ({})", session.getId(), closeStatus);
    }

    /**
     * 부분 메시지를 지원하는지 여부를 반환합니다.
     *
     * @return 항상 false (부분 메시지 미지원)
     */
    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    /**
     * 모든 연결된 클라이언트에게 로그 메시지를 전송합니다.
     * <p>
     * 각 {@link WebSocketSession}에 대해 동기화된 블록 내에서 메시지를 전송함으로써,
     * {@code sendMessage} 호출 시 발생할 수 있는 {@link java.lang.IllegalStateException}
     * (예: "TEXT_PARTIAL_WRITING") 예외를 방지합니다.
     * </p>
     * <p>
     * 세션 객체는 스레드 안전하지 않으므로, 세션마다 고유의 락 객체를 생성하고,
     * 이를 통해 전송 동작을 직렬화(serialization)합니다.
     * </p>
     *
     * @param logMsg 전송할 로그 문자열
     */
    public void broadcast(String logMsg) {
        if (sessions.isEmpty()) {
            log.warn("[LogWebSocketHandler] 연결된 클라이언트 없음");
        }

        for (WebSocketSession session : sessions) {
            if(session.isOpen()){
                sessionLocks.putIfAbsent(session, new Object()); // 세션별 락 등록
                Object lock = sessionLocks.get(session);

                try {
                    synchronized (lock){ // 세션마다 락을 잡고 전송
                        session.sendMessage(new TextMessage(logMsg));
                    }
                    log.debug("[LogWebSocketHandler] 로그 전송 완료: {}", logMsg);
                } catch (IOException e) {
                    log.error("[LogWebSocketHandler] 메시지 전송 실패", e);
                }
            }
        }
    }
}
