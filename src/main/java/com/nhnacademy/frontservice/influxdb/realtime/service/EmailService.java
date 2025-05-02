package com.nhnacademy.frontservice.influxdb.realtime.service;

/**
 * 관리자에게 이메일을 전송하는 기능을 정의한 서비스 인터페이스입니다.
 * <p>
 * 주로 이상 출입 등 경고 상황 발생 시 관리자에게 알림 이메일을 전송하는 데 사용됩니다.
 */
public interface EmailService {

    /**
     * 이상 출입 등 감지된 이벤트를 관리자에게 이메일로 전송합니다.
     *
     * @param to      수신자 이메일 주소
     * @param subject 이메일 제목
     * @param text    이메일 본문 내용
     */
    void sendIntrusionAlertToAdmin(String to, String subject, String text);
}
