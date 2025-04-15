package com.nhnacademy.frontservice.common.config;

import com.nhnacademy.frontservice.common.handler.LoginSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity(debug = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final LoginSuccessHandler loginSuccessHandler;
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
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2Login(oauth ->
                        oauth
                                .loginPage("/login")
                                .successHandler(loginSuccessHandler)

                )
                .logout(logout ->
                        logout.invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                )

              ;
        return http.build();
    }
}
