package com.nhnacademy.frontservice.handler.successhandling;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.model.dto.JwtIssueRequest;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.Map;

@Slf4j
public class JwtLoginSuccessHanlder implements AuthenticationSuccessHandler {

    private final GatewayAdaptor gatewayAdaptor;

    public JwtLoginSuccessHanlder(GatewayAdaptor gatewayAdaptor) {
        this.gatewayAdaptor = gatewayAdaptor;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
//        log.info("으아아아악"+authentication.toString());
        System.out.println("으아아아악"+authentication.toString());
        log.info("✅ 로그인 성공한 사용자: {}", authentication.getName());

        JwtIssueRequest jwtIssueRequest = new JwtIssueRequest(authentication.getName(), authentication.getAuthorities().toString());

        // Feign으로 Auth 서버에 JWT 발급 요청
        ResponseEntity<Map<String, String>> tokenResponse = gatewayAdaptor.getJwtToken(jwtIssueRequest);

        Map<String, String> tokens = tokenResponse.getBody();

        String accessToken = tokens.get("accessToken");
        String refreshToken = tokens.get("refreshToken");

        System.out.println("accessToken: " + accessToken);
        System.out.println("refreshToken: " + refreshToken);

        response.sendRedirect("/index");
    }
}
