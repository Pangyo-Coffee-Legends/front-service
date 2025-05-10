package com.nhnacademy.frontservice.common.Authentication;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

public class JwtAuthentication extends UsernamePasswordAuthenticationToken {
    private final String jwtToken;

    public JwtAuthentication(UserDetails principal, String jwtToken, Collection<? extends GrantedAuthority> authorities) {
        super(principal, null, authorities);
        this.jwtToken = jwtToken;
    }

    @Override
    public Object getCredentials() {
        return this.jwtToken;
    }
}

