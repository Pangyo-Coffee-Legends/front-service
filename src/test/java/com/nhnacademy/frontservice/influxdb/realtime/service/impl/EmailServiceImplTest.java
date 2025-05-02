package com.nhnacademy.frontservice.influxdb.realtime.service.impl;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

/**
 * {@link EmailServiceImpl} 클래스의 기능을 테스트하는 단위 테스트 클래스입니다.
 * <p>
 * JavaMailSender를 Mocking하여 실제 메일 전송 없이 send 메서드 호출 여부를 검증합니다.
 */
@ExtendWith(MockitoExtension.class)
class EmailServiceImplTest {

    @Mock
    JavaMailSender javaMailSender;

    @InjectMocks
    EmailServiceImpl emailService;

    /**
     * {@link EmailServiceImpl#sendIntrusionAlertToAdmin(String, String, String)} 메서드가
     * 이상 출입 발생 시 JavaMailSender의 send 메서드를 호출하는지 검증합니다.
     * <p>
     * 내부적으로 {@link SimpleMailMessage}를 사용하여 메일을 생성하고 전송 요청을 합니다.
     */
    @Test
    @DisplayName("이상 출입 발생시 관리자에게 이메일 자동 발송")
    void sendIntrusionAlertToAdmin() {
        emailService.sendIntrusionAlertToAdmin(
                "kim5472678@gmail.com",
                "⚠️ 이상 출입 감지 알림",
                "\n이상 출입자 발생.\n관리자 확인 바랍니다."
        );

        verify(javaMailSender).send(any(SimpleMailMessage.class));
    }
}