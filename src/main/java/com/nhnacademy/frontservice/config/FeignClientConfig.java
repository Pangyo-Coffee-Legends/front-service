package com.nhnacademy.frontservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * FeignClient 요청 시 Authorization 헤더를 복사해주는 설정입니다.
 */
@Configuration
public class FeignClientConfig {

    /**
     * Feign 요청 전 Authorization 헤더를 복사합니다.
     *
     * @return RequestInterceptor
     */
    @Bean
    public RequestInterceptor requestInterceptor() {
        return template -> {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String authorizationHeader = request.getHeader("Authorization");

                // Authorization 헤더가 없는 경우를 대비해 추가
                if (authorizationHeader == null || authorizationHeader.isEmpty()) {
                    // 여기서 세션, 쿠키 등에서 토큰을 가져오는 로직을 추가할 수 있음
                    // 예시로 JSESSIONID를 이용할 수도 있지만, 지금은 넘어갑니다.
                } else {
                    template.header("Authorization", authorizationHeader);
                }
            }
        };
    }
}
