package com.nhnacademy.frontservice.common.config;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.common.handler.exceptionhandling.CustomAccessDeniedHandler;
import com.nhnacademy.frontservice.common.handler.successhandling.JwtLoginSuccessHandler;
import com.nhnacademy.frontservice.common.handler.successhandling.OAuthSuccessHandler;
import com.nhnacademy.frontservice.filter.JwtPayloadExtractionFilter;
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
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity(debug = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final GatewayAdaptor gatewayAdaptor;
    private final OAuthSuccessHandler oauthSuccessHandler;
    private final JwtPayloadExtractionFilter jwtPayloadExtractionFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        // 누구나 접근 가능한 경로
                        .requestMatchers("/", "/login", "/signup", "/css/**", "/js/**", "/images/**").permitAll()

                        // 관리자만 접근 가능한 경로
                        .requestMatchers(
                                "/admin/**",
                                "/notification",
                                "/entry-charts",
                                "/working-hours-statistics",
                                "/analysis",
                                "/comfort-dashboard",
                                "/rule-group",
                                "/sensor"
                        ).hasRole("ADMIN")

                        // 그 외 나머지는 인증 필요
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtPayloadExtractionFilter, UsernamePasswordAuthenticationFilter.class) // ✅ 추가
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(flc -> flc
                        .loginPage("/login")
                        .loginProcessingUrl("/generalLogin")
                        .successHandler(new JwtLoginSuccessHandler(gatewayAdaptor))
                )
                .oauth2Login(oauth -> oauth
                        .loginPage("/login")
                        .successHandler(oauthSuccessHandler)
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID", "accessToken")
                        .logoutSuccessUrl("/")
                );

        http.exceptionHandling(ehc -> ehc.accessDeniedHandler(new CustomAccessDeniedHandler()));

        return http.build();
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

}
