package com.nhnacademy.frontservice.common.handler.successhandling;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.dto.token.JwtIssueRequest;
import com.nhnacademy.frontservice.dto.token.JwtResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.time.Duration;

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

        String accessToken = tokens.getAccessToken();
        String refreshToken = tokens.getRefreshToken();

        addCookie("accessToken", accessToken, response);
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("Strict")
                .maxAge(Duration.ofDays(7))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // ✅ SecurityContextHolder에 인증 객체 수동 등록
        SecurityContextHolder.getContext().setAuthentication(authentication); // 🔥 여기가 핵심
        System.out.println("ㅎㅇㅎㅇ"+authentication);
        System.out.println("ㅎㅇㅎㅇ1"+SecurityContextHolder.getContext().getAuthentication().getName());


        response.sendRedirect("/index");
//        request.getRequestDispatcher("/index").forward(request, response);
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
