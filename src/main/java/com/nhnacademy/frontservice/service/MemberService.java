package com.nhnacademy.frontservice.service;

import com.nhnacademy.frontservice.dto.*;

import java.util.List;

public interface MemberService {
    MemberResponse getMbEmail(String mbEmail);

    MemberResponse register(MemberRegisterRequest registerRequest);

    MemberResponse updateMember(Long mbNo, MemberUpdateRequest registerRequest);

    MemberResponse deleteMember(Long mbNo);

    MemberResponse updatePassword(Long mbNo, MemberUpdatePasswordRequest registerRequest);

    List<MemberInfoResponse> getMemberInfoList();
}
