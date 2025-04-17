package com.nhnacademy.frontservice.config;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.handler.exceptionhandling.CustomAccessDeniedHandler;
import com.nhnacademy.frontservice.handler.successhandling.JwtLoginSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;

@EnableWebSecurity
@Configuration
public class jwtAuthConfig {
    @Bean
    SecurityFilterChain jwtFilterChain(HttpSecurity http, GatewayAdaptor gatewayAdaptor) throws Exception {
        http.csrf(csrfConfig -> csrfConfig.disable())
//                .sessionManagement(sessionConfig -> sessionConfig.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                .cors(corsConfig -> corsConfig.configurationSource(new CorsConfigurationSource() {
//                    @Override
//                    public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
//                        CorsConfiguration config = new CorsConfiguration();
//                        // setAllowedOrigins() 에는 허용할 출처만 적음. / 출처 모두 허용으로 설정.
//                        config.setAllowedOrigins(Collections.singletonList("*"));
//                        // setAllowedMethods는 브라우저가 특정 http 메서드에 대해서만 허용하는 메서드 / 모두 허용하고 있다.
//                        config.setAllowedMethods(Collections.singletonList("*"));
//                        // 브라우저가 백엔드 api에 요청을 보낼 때 자격 증명이나 적용 가능한 쿠키를 전송할 수 있도록 설정
//                        config.setAllowCredentials(true);
//                        // UI 애플리케이션이나 다른 출처에서 백엔드가 수락할 수 있는 헤더 목록을 정의
//                        config.setAllowedHeaders(Collections.singletonList("*"));
//                        config.setExposedHeaders(Arrays.asList("Authorization"));
//                        // 브라우저에게 이 모든 설정을 1시간 동안 기억하라고 지시
//                        config.setMaxAge(3600L);
//                        return config;
//                    }
//                }))
                .authorizeHttpRequests((requests) -> requests
                        .requestMatchers("/123").authenticated()
                        .requestMatchers("/**","/login/**","/error","/css/**", "/js/**", "/images/**").permitAll())
                .formLogin(flc -> flc
                        .loginPage("/login") // 웹 페이지 반환하는 컨트롤러 매핑 설정
                        .loginProcessingUrl("/generalLogin") // 로그인 처리 URL (form의 action과 같아야 함) / 얘는 컨트롤러 없어도 됨.
                        .successHandler(new JwtLoginSuccessHandler(gatewayAdaptor))) // Jwt 발급 핸들러
//                        .defaultSuccessUrl("/index")) successful Handler와 같이 사용금지.
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/login")
                        .successHandler(new JwtLoginSuccessHandler(gatewayAdaptor))); // Jwt 발급 핸들러
//                        .defaultSuccessUrl("/index"));
//        http.httpBasic(withDefaults());

        http.exceptionHandling(ehc -> ehc.accessDeniedHandler(new CustomAccessDeniedHandler()));
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    ClientRegistrationRepository clientRegistrationRepository() {
        ClientRegistration github = githubClientRegistration();
//        ClientRegistration facebook = facebookClientRegistration();
        return new InMemoryClientRegistrationRepository(github);
    }

    private ClientRegistration githubClientRegistration() {
        return CommonOAuth2Provider.GITHUB.getBuilder("github").clientId("Ov23liTsu4lbLfaWP5Bv")
                .clientSecret("afe8b11901df76e328613cdc1ad7ab9cb8e33b14").build();
    }
}

