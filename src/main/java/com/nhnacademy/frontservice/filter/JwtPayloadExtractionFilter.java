package com.nhnacademy.frontservice.filter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhnacademy.frontservice.Authentication.JwtAuthentication;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

/**
 * JWT 토큰의 Payload 정보를 추출하여 Security Context에 권한 정보를 설정하는 필터입니다.
 * <p>
 * HTTP 요청의 쿠키에서 JWT 토큰을 추출한 후,
 * Payload 영역을 디코딩하여 사용자 이메일과 권한 정보를 Security Context에 주입합니다.
 *
 */
@Slf4j
@Component
public class JwtPayloadExtractionFilter extends OncePerRequestFilter {

    /**
     * HTTP 요청마다 실행되는 필터 메서드입니다.
     * <p>
     * 1. 쿠키에서 JWT 토큰 추출
     * 2. 토큰 분해 후 Payload 디코딩
     * 3. JSON 파싱을 통한 사용자 정보 추출
     * 4. Security Context에 권한 정보 설정
     *
     * @param request     HTTP 요청 객체
     * @param response    HTTP 응답 객체
     * @param filterChain 다음 필터 체인
     * @throws ServletException 서블릿 예외 발생 시
     * @throws IOException      입출력 예외 발생 시
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 쿠키에서 JWT 토큰 추출
        String jwtToken = extractTokenFromCookie(request, "accessToken");

        if (jwtToken != null && !jwtToken.isEmpty()) {
            try {
                // JWT 토큰의 Payload 부분만 디코딩
                String[] chunks = jwtToken.split("\\.");
                if (chunks.length >= 2) {
                    String payload = new String(Base64.getUrlDecoder().decode(chunks[1]), StandardCharsets.UTF_8);

                    // JSON 파싱
                    JsonNode payloadJson = new ObjectMapper().readTree(payload);

                    // 필요한 정보 추출
                    String email = payloadJson.has("email") ? payloadJson.get("email").asText() : null;

                    // 만료 시간 확인 (선택적)
                    if (payloadJson.has("exp")) {
                        long expTime = payloadJson.get("exp").asLong() * 1000; // JWT exp는 초 단위
                        if (expTime < System.currentTimeMillis()) {
                            log.debug("JWT 토큰이 만료되었습니다.");
                            filterChain.doFilter(request, response);
                            return;
                        }
                    }

                    // 권한 정보 생성
                    List<GrantedAuthority> authorities = new ArrayList<>();

                    if (payloadJson.has("roles") && payloadJson.get("roles").isArray()) {
                        for (JsonNode roleNode : payloadJson.get("roles")) {
                            String role = roleNode.asText();
                            authorities.add(new SimpleGrantedAuthority(role));
                        }
                        log.debug("추출된 권한: {}", authorities);
                    }

                    // 인증 객체 생성
                    UserDetails userDetails = new User(email, "", authorities);

                    Authentication authentication =
                            new JwtAuthentication(userDetails, jwtToken, authorities);

                    // SecurityContextHolder에 인증 정보 설정
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                log.error("JWT 토큰 처리 중 오류 발생: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * 지정된 이름의 쿠키에서 JWT 토큰 값을 추출합니다.
     *
     * @param request    HTTP 요청 객체
     * @param cookieName 추출 대상 쿠키 이름 (기본값: "accessToken")
     * @return 추출된 JWT 토큰 문자열, 없을 경우 null 반환
     */
    private String extractTokenFromCookie(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
