package com.nhnacademy.frontservice.common.advice;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.dto.JwtResponse;
import com.nhnacademy.frontservice.dto.TokenRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Arrays;

@ControllerAdvice
@RequiredArgsConstructor
public class CommonAdvice {
    private final GatewayAdaptor adaptor;
    private final HttpServletRequest request;

    @ExceptionHandler(HttpClientErrorException.Unauthorized.class)
    @ResponseStatus(code= HttpStatus.UNAUTHORIZED)
    public ResponseEntity<?> unauthorizedExceptionHandler(){
        String refresh  = Arrays.stream(request.getCookies())
                                .filter(cookie -> "refreshToken".equals(cookie.getName()))
                                .findFirst()
                                .map(Cookie::getValue)
                                .orElseThrow(() -> new RuntimeException("RefreshToken not found"));

        ResponseEntity<JwtResponse> tokenResponse = adaptor.reissueToken(new TokenRequest(refresh));

        JwtResponse response = tokenResponse.getBody();

        if(response == null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).header(HttpHeaders.LOCATION, "/login").build();
        }

        return ResponseEntity.ok().build();
    }
}
