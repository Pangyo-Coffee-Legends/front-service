package com.nhnacademy.frontservice.config;

import com.nhnacademy.frontservice.model.domain.Member;
import com.nhnacademy.frontservice.model.dto.MemberResponse;
import com.nhnacademy.frontservice.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomMemberDetailsService implements UserDetailsService {
    private final MemberService memberService;

    @Override
    public UserDetails loadUserByUsername(String mbEmail) throws UsernameNotFoundException {
        MemberResponse member = memberService.findBymbEmail(mbEmail);
        if (member == null) {
            throw new UsernameNotFoundException("Member not found.");
        }
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(member.getRole().getRoleName()));

        return new User(member.getMbEmail(), member.getMbPassword(), authorities);
    }
}