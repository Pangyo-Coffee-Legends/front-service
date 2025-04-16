package com.nhnacademy.frontservice.service;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.model.dto.MemberResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final GatewayAdaptor gatewayAdaptor;

    public MemberResponse findBymbEmail(String mbEmail) {
        MemberResponse member = gatewayAdaptor.findBymbEmail(mbEmail);
        if (member == null) {
            throw new UsernameNotFoundException("Member not found.");
        }

        return member;
    }
}
