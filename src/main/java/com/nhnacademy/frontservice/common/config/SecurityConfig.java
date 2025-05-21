package com.nhnacademy.frontservice.common.config;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
//import com.nhnacademy.frontservice.common.filter.JwtAuthenticationFilter;
import com.nhnacademy.frontservice.common.handler.exceptionhandling.CustomAccessDeniedHandler;
import com.nhnacademy.frontservice.common.handler.successhandling.JwtLoginSuccessHandler;
import com.nhnacademy.frontservice.common.handler.successhandling.OAuthSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity(debug = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final GatewayAdaptor gatewayAdaptor;
    private final OAuthSuccessHandler oauthSuccessHandler;
//    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> {
//                    auth.requestMatchers(
//                                    "/",
//                                    "/login",
//                                    "/css/**",
//                                    "/js/**",
//                                    "/images/**"
//                        ).permitAll()
                        auth.anyRequest().permitAll();
                })
//                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(flc -> flc
                        .loginPage("/login") // 웹 페이지 반환하는 컨트롤러 매핑 설정
                        .loginProcessingUrl("/generalLogin") // 로그인 처리 URL (form의 action과 같아야 함) / 얘는 컨트롤러 없어도 됨.
                        .successHandler(new JwtLoginSuccessHandler(gatewayAdaptor)))
                .oauth2Login(oauth ->
                        oauth
                                .loginPage("/login")
                                .successHandler(oauthSuccessHandler)
                )
                .logout(logout ->
                        logout
                                .logoutUrl("/logout")
                                .invalidateHttpSession(true)
                                .clearAuthentication(true)
                                .deleteCookies("JSESSIONID")
                                .deleteCookies("accessToken")
                                .logoutSuccessUrl("/")
                )
        ;

        http.exceptionHandling(ehc -> ehc.accessDeniedHandler(new CustomAccessDeniedHandler()));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

}
