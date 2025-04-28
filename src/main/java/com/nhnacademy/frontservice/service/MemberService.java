package com.nhnacademy.frontservice.service;

import com.nhnacademy.frontservice.dto.MemberRegisterRequest;
import com.nhnacademy.frontservice.dto.MemberResponse;
import com.nhnacademy.frontservice.dto.MemberUpdatePasswordRequest;
import com.nhnacademy.frontservice.dto.MemberUpdateRequest;

public interface MemberService {
    MemberResponse getMbEmail(String mbEmail);

    MemberResponse register(MemberRegisterRequest registerRequest);

    MemberResponse updateMember(Long mbNo, MemberUpdateRequest registerRequest);

    MemberResponse deleteMember(Long mbNo);

    MemberResponse updatePassword(Long mbNo, MemberUpdatePasswordRequest registerRequest);
}
