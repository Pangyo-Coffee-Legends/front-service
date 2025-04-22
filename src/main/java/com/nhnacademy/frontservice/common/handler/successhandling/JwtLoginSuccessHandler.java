package com.nhnacademy.frontservice.common.handler.successhandling;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.dto.JwtIssueRequest;
import com.nhnacademy.frontservice.dto.JwtResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;

@Slf4j
public class JwtLoginSuccessHandler implements AuthenticationSuccessHandler {

    private final GatewayAdaptor gatewayAdaptor;

    public JwtLoginSuccessHandler(GatewayAdaptor gatewayAdaptor) {
        this.gatewayAdaptor = gatewayAdaptor;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        log.info("✅ 로그인 성공한 사용자: {}", authentication.getName());

        JwtIssueRequest jwtIssueRequest = new JwtIssueRequest(authentication.getName(), authentication.getAuthorities().toString());

        // Feign으로 Auth 서버에 JWT 발급 요청
        ResponseEntity<JwtResponse> tokenResponse = gatewayAdaptor.issueToken(jwtIssueRequest);
        if(!tokenResponse.getStatusCode().is2xxSuccessful()){
            throw new RuntimeException();
        }

        JwtResponse tokens = tokenResponse.getBody();

        // todo 쿠키에 넣기
        String accessToken = tokens.getAccessToken();
        String refreshToken = tokens.getRefreshToken();

        addCookie("accessToken", accessToken, response);
        addCookie("refreshToken", refreshToken, response);

        System.out.println("accessToken: " + accessToken);
        System.out.println("refreshToken: " + refreshToken);

        response.sendRedirect("/index");
    }


    private void addCookie(String tokenName, String token, HttpServletResponse response){
        Cookie cookie = new Cookie(tokenName, token);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setMaxAge(36000);
        response.addCookie(cookie);
    }
}
