package com.nhnacademy.frontservice.config;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.handler.exceptionhandling.CustomAccessDeniedHandler;
import com.nhnacademy.frontservice.handler.successhandling.JwtLoginSuccessHandler;
import com.nhnacademy.frontservice.handler.successhandling.OAuthSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity(debug = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final GatewayAdaptor gatewayAdaptor;
    private final OAuthSuccessHandler oauthSuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(request -> {
                    request
                            .anyRequest().permitAll(); // 모든 페이지에 대한 접근을 허용하되, gateway에서 JWT 유효성 검증이 된 후 오는 데이터를 들고 있지 않는 경우 Exception 발생 시켜 login 페이지로 redirect.
                })
                .formLogin(form -> form
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
