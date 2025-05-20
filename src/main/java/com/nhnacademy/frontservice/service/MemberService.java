package com.nhnacademy.frontservice.service;

import com.nhnacademy.frontservice.dto.member.*;

import java.util.List;

public interface MemberService {
    MemberResponse getMbEmail(String mbEmail);

    MemberResponse register(MemberRegisterRequest registerRequest);

}
