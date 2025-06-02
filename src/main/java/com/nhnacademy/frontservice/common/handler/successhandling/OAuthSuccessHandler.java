package com.nhnacademy.frontservice.common.handler.successhandling;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.common.auth.EmailThreadLocal;
import com.nhnacademy.frontservice.dto.token.JwtIssueRequest;
import com.nhnacademy.frontservice.dto.token.JwtResponse;
import com.nhnacademy.frontservice.dto.member.MemberRegisterRequest;
import com.nhnacademy.frontservice.dto.member.MemberResponse;
import com.nhnacademy.frontservice.service.MemberService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;

@RequiredArgsConstructor
@Component
public class OAuthSuccessHandler implements AuthenticationSuccessHandler {

    private final GatewayAdaptor gatewayAdaptor;
    private final MemberService memberService;


    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {

        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();

        MemberRegisterRequest registerRequest = new MemberRegisterRequest("ROLE_USER", name, email, "tEst123!", "tEst123!", "010-0000-0000");

        MemberResponse memberResponse = memberService.getMbEmail(email);

        if(memberResponse == null){
            memberService.register(registerRequest);
        }
        JwtIssueRequest jwtIssueRequest = new JwtIssueRequest(email, "ROLE_USER");

        // Feign으로 Auth 서버에 JWT 발급 요청
        ResponseEntity<JwtResponse> tokenResponse = gatewayAdaptor.issueToken(jwtIssueRequest);

        JwtResponse tokens = tokenResponse.getBody();

        String accessToken = tokens.getAccessToken();
        addCookie("accessToken", accessToken, response);
        String refreshToken = tokens.getRefreshToken();
        addCookie("refreshToken", refreshToken, response);

        EmailThreadLocal.setEmailLocal(email);

//        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
//                .httpOnly(true)
//                .secure(true)
//                .path("/")
//                .sameSite("Strict")
//                .maxAge(Duration.ofDays(7))
//                .build();
//
//        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        response.sendRedirect("/index");
    }

    private void addCookie(String tokenName, String token, HttpServletResponse response){
        ResponseCookie cookie = ResponseCookie.from(tokenName, token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("None")
                .maxAge(Duration.ofDays(7))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}