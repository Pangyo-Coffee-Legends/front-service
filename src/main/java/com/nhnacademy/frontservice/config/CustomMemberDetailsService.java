package com.nhnacademy.frontservice.config;

import com.nhnacademy.frontservice.dto.MemberResponse;
import com.nhnacademy.frontservice.service.MemberService;
import com.nhnacademy.frontservice.service.impl.MemberServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CustomMemberDetailsService implements UserDetailsService {
    private final MemberService memberService;

    @Override
    public UserDetails loadUserByUsername(String mbEmail) throws UsernameNotFoundException {
        MemberResponse member = memberService.getMbEmail(mbEmail);
        if (member == null) {
            throw new UsernameNotFoundException("Member not found.");
        }
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(member.getRole()));

        return new User(member.getMbEmail(), member.getMbPassword(), authorities);
    }
}