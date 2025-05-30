package com.nhnacademy.frontservice.common.advice;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.dto.token.JwtResponse;
import com.nhnacademy.frontservice.dto.token.TokenRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.time.Duration;
import java.util.Arrays;

@ControllerAdvice
@RequiredArgsConstructor
public class CommonAdvice {
    private final GatewayAdaptor adaptor;
    private final HttpServletRequest request;

    @ExceptionHandler(HttpClientErrorException.Unauthorized.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ResponseEntity<?> unauthorizedExceptionHandler() {
        String refresh = Arrays.stream(request.getCookies())
                .filter(cookie -> "refreshToken".equals(cookie.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new RuntimeException("RefreshToken not found"));

        ResponseEntity<JwtResponse> tokenResponse = adaptor.reissueToken(new TokenRequest(refresh));
        JwtResponse response = tokenResponse.getBody();

        if (response == null || response.getAccessToken() == null || response.getRefreshToken() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header(HttpHeaders.LOCATION, "/login")
                    .build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, createAccessTokenCookie(response.getAccessToken()))
                .header(HttpHeaders.SET_COOKIE, createRefreshTokenCookie(response.getRefreshToken()))
                .build();
    }

    private String createAccessTokenCookie(String token) {
        return ResponseCookie.from("accessToken", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("Lax")
                .maxAge(Duration.ofMinutes(60))
                .build()
                .toString();
    }

    private String createRefreshTokenCookie(String token) {
        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("Lax")
                .maxAge(Duration.ofDays(1))
                .build()
                .toString();
    }
}