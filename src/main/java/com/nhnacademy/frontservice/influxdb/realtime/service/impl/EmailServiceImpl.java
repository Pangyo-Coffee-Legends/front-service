package com.nhnacademy.frontservice.influxdb.realtime.service.impl;

import com.nhnacademy.frontservice.influxdb.realtime.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * {@link EmailService}의 구현체로, JavaMailSender를 사용하여 이메일을 발송하는 서비스입니다.
 * <p>
 * 주로 이상 출입 감지 시 관리자에게 경고 이메일을 자동으로 전송하는 기능을 담당합니다.
 */
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

//    private final JavaMailSender javaMailSender;

    /**
     * 지정된 수신자에게 제목과 본문이 포함된 경고 이메일을 전송합니다.
     *
     * @param to      수신자 이메일 주소
     * @param subject 이메일 제목
     * @param text    이메일 본문 내용
     */
    @Override
    public void sendIntrusionAlertToAdmin(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
//        javaMailSender.send(message);

    }
}
