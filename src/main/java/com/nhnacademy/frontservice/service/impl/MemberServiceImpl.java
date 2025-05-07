package com.nhnacademy.frontservice.service.impl;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.dto.member.*;
import com.nhnacademy.frontservice.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * MemberService 인터페이스 구현체입니다.
 * 회원 등록, 조회, 수정, 삭제, 비밀번호 변경 기능을 제공합니다.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final GatewayAdaptor gatewayAdaptor;

    /**
     * 이메일로 회원 정보를 조회합니다.
     *
     * @param mbEmail 조회할 회원 이메일
     * @return 회원 정보 또는 존재하지 않을 경우 null 반환
     */
    @Override
    public MemberResponse getMbEmail(String mbEmail) {
        try {
            ResponseEntity<MemberResponse> member = gatewayAdaptor.getMemberByMbEmail(mbEmail);
            return member.getBody();
        } catch (Exception e) { // todo: Exception 수정
            return null;
        }
    }

    /**
     * 회원 등록을 수행합니다.
     *
     * @param registerRequest 회원 등록 요청 데이터
     * @return 등록된 회원 정보
     */
    @Override
    public MemberResponse register(MemberRegisterRequest registerRequest) {
        try {
            ResponseEntity<MemberResponse> member = gatewayAdaptor.registerMember(registerRequest);
            return member.getBody();
        } catch (Exception e) {
            throw new RuntimeException("회원 등록 실패", e);
        }
    }
}
