package com.nhnacademy.frontservice.Authentication;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

/**
 * JWT 기반 인증 정보를 담는 커스텀 Authentication 구현입니다.
 * <p>
 * Spring Security에서 SecurityContext에 저장될 수 있도록
 * JWT 토큰을 credentials로 포함하며, principal에는 사용자 정보(UserDetails)를 담습니다.
 */
public class JwtAuthentication extends UsernamePasswordAuthenticationToken {
    private final String jwtToken;

    /**
     * JWT 인증 객체를 생성합니다.
     *
     * @param principal   인증된 사용자 정보 (UserDetails)
     * @param jwtToken    JWT 토큰 문자열 (credentials로 사용)
     * @param authorities 사용자에게 부여된 권한 목록
     */
    public JwtAuthentication(UserDetails principal, String jwtToken, Collection<? extends GrantedAuthority> authorities) {
        super(principal, null, authorities);
        this.jwtToken = jwtToken;
    }

    /**
     * 인증 자격 증명(JWT 토큰)을 반환합니다.
     * 기본 UsernamePasswordAuthenticationToken은 비밀번호를 반환하지만,
     * 이 구현에서는 JWT 토큰을 반환합니다.
     *
     * @return JWT 토큰 문자열
     */
    @Override
    public Object getCredentials() {
        return this.jwtToken;
    }
}

