package com.nhnacademy.frontservice.log.realtime;

import lombok.extern.slf4j.Slf4j;

/**
 * WebSocket 핸들러를 전역에서 접근 가능하도록 보관하는 유틸 클래스입니다.
 */
@Slf4j
public class WebSocketContextHolder {

    private static LogWebSocketHandler handler;

    /**
     * WebSocket 핸들러를 설정합니다.
     *
     * @param h 설정할 LogWebSocketHandler 객체
     */
    public static void setHandler(LogWebSocketHandler h) {
        handler = h;
        log.info("[WebSocketContextHolder] 핸들러 설정됨");
    }

    /**
     * 현재 설정된 WebSocket 핸들러를 반환합니다.
     *
     * @return 설정된 LogWebSocketHandler 객체 (null일 수 있음)
     */
    public static LogWebSocketHandler getHandler() {
        if (handler == null) {
            log.warn("[WebSocketContextHolder] 핸들러가 아직 설정되지 않았습니다.");
        }
        return handler;
    }
}
