package com.nhnacademy.frontservice.service.impl;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.dto.MemberRegisterRequest;
import com.nhnacademy.frontservice.dto.MemberResponse;
import com.nhnacademy.frontservice.exception.NotFoundException;
import com.nhnacademy.frontservice.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {
    private final GatewayAdaptor gatewayAdaptor;

    @Override
    public MemberResponse getMbEmail(String mbEmail) {
        ResponseEntity<MemberResponse> member = gatewayAdaptor.getMemberByMbEmail(mbEmail);
        if (!member.getStatusCode().is2xxSuccessful()) {
//            throw new UsernameNotFoundException("Member not found.");
            return null;
        }

        return member.getBody();
    }

    @Override
    public MemberResponse register(MemberRegisterRequest registerRequest) {
        ResponseEntity<MemberResponse> member = gatewayAdaptor.registerMember(registerRequest);
        if(!member.getStatusCode().is2xxSuccessful()){
            throw new NotFoundException("member not found");
        }
        return member.getBody();
    }
}
