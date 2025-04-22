package com.nhnacademy.frontservice.service;

import com.nhnacademy.frontservice.dto.MemberRegisterRequest;
import com.nhnacademy.frontservice.dto.MemberResponse;

public interface MemberService {
    MemberResponse getMbEmail(String mbEmail);

    MemberResponse register(MemberRegisterRequest registerRequest);

    void logout(String accessToken);
}
