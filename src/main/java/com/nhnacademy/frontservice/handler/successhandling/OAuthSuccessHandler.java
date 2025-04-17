package com.nhnacademy.frontservice.handler.successhandling;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.dto.JwtIssueRequest;
import com.nhnacademy.frontservice.dto.JwtResponse;
import com.nhnacademy.frontservice.dto.MemberRegisterRequest;
import com.nhnacademy.frontservice.dto.MemberResponse;
import com.nhnacademy.frontservice.service.MemberService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

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

//        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        MemberRegisterRequest registerRequest = new MemberRegisterRequest(name, email, "password", "010-0000-0000", "password");

        MemberResponse memberResponse = memberService.getMbEmail(email);
        if(memberResponse == null){
            memberService.register(registerRequest);
        }
        JwtIssueRequest jwtIssueRequest = new JwtIssueRequest(email, "ROLE_USER");

        // Feign으로 Auth 서버에 JWT 발급 요청
        ResponseEntity<JwtResponse> tokenResponse = gatewayAdaptor.getJwtToken(jwtIssueRequest);
        if(!tokenResponse.getStatusCode().is2xxSuccessful()){
            throw new RuntimeException();
        }

        JwtResponse tokens = tokenResponse.getBody();

        String accessToken = tokens.getAccessToken();
        String refreshToken = tokens.getRefreshToken();

        addCookie("accessToken", accessToken, response);
        addCookie("refreshToken", refreshToken, response);

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
