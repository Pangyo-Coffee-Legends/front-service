package com.nhnacademy.frontservice.service.impl;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.dto.MemberResponse;
import com.nhnacademy.frontservice.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {
    private final GatewayAdaptor gatewayAdaptor;

    @Override
    public MemberResponse getMbEmail(String mbEmail) {
        MemberResponse member = gatewayAdaptor.findByMbEmail(mbEmail);
        if (member == null) {
            throw new UsernameNotFoundException("Member not found.");
        }

        return member;
    }
}
