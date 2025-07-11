package com.nhnacademy.frontservice.common.handler.successhandling;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.dto.member.MemberRegisterRequest;
import com.nhnacademy.frontservice.dto.member.MemberResponse;
import com.nhnacademy.frontservice.dto.token.JwtIssueRequest;
import com.nhnacademy.frontservice.dto.token.JwtResponse;
import com.nhnacademy.frontservice.service.MemberService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

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
        JwtIssueRequest jwtIssueRequest = new JwtIssueRequest(email, memberResponse.getRoleName());

        // Feign으로 Auth 서버에 JWT 발급 요청
        ResponseEntity<JwtResponse> tokenResponse = gatewayAdaptor.issueToken(jwtIssueRequest);

        JwtResponse tokens = tokenResponse.getBody();

        String accessToken = tokens.getAccessToken();
        addCookie("accessToken", accessToken, response);

//        String refreshToken = tokens.getRefreshToken();
//        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
//                                                .httpOnly(true)
//                                                .secure(true)
//                                                .path("/")
//                                                .sameSite("Strict")
//                                                .maxAge(Duration.ofDays(7))
//                                                .build();
//
//        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(memberResponse.getRoleName()));
        OAuth2User newUser = new DefaultOAuth2User(authorities, oidcUser.getAttributes(), "email");
        Authentication newAuth = new UsernamePasswordAuthenticationToken(newUser, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(newAuth);

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
