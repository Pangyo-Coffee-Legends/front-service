package com.nhnacademy.frontservice.common.config;

import com.nhnacademy.frontservice.dto.member.MemberResponse;
import com.nhnacademy.frontservice.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CustomMemberDetailsService implements UserDetailsService {
    private final MemberService memberService;

    @Override
    public UserDetails loadUserByUsername(String mbEmail) throws UsernameNotFoundException {
        MemberResponse member = memberService.getMbEmail(mbEmail);
        System.out.println("dfdf" + member);
        if (member == null) {
            throw new UsernameNotFoundException("Member not found.");
        }
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(member.getRoleName()));

        return new User(member.getEmail(), member.getPassword(), authorities);
    }
}