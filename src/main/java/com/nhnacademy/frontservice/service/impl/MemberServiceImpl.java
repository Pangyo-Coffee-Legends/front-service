package com.nhnacademy.frontservice.service.impl;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.dto.MemberRegisterRequest;
import com.nhnacademy.frontservice.dto.MemberResponse;
import com.nhnacademy.frontservice.dto.MemberUpdatePasswordRequest;
import com.nhnacademy.frontservice.dto.MemberUpdateRequest;
import com.nhnacademy.frontservice.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

/**
 * MemberService 인터페이스 구현체입니다.
 * 회원 등록, 조회, 수정, 삭제, 비밀번호 변경 기능을 제공합니다.
 */
@Service
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

    /**
     * 회원 정보를 수정합니다.
     *
     * @param mbNo 수정할 회원 번호
     * @param updateRequest 수정할 회원 데이터
     * @return 수정된 회원 정보
     */
    @Override
    public MemberResponse updateMember(Long mbNo, MemberUpdateRequest updateRequest) {
        try {
            // GatewayAdaptor에 updateMember()가 아직 없으면 추가 필요
            ResponseEntity<MemberResponse> response = gatewayAdaptor.updateMember(mbNo, updateRequest);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("회원 정보 수정 실패", e);
        }
    }

    /**
     * 회원 탈퇴(삭제)를 수행합니다.
     *
     * @param mbNo 삭제할 회원 번호
     * @return 삭제된 회원 정보
     */
    @Override
    public MemberResponse deleteMember(Long mbNo) {
        try {
            // GatewayAdaptor에 deleteMember()가 아직 없으면 추가 필요
            ResponseEntity<MemberResponse> response = gatewayAdaptor.deleteMember(mbNo);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("회원 삭제 실패", e);
        }
    }

    /**
     * 회원 비밀번호를 변경합니다.
     *
     * @param mbNo 변경할 회원 번호
     * @param updatePasswordRequest 비밀번호 변경 요청 데이터
     * @return 변경된 회원 정보
     */
    @Override
    public MemberResponse updatePassword(Long mbNo, MemberUpdatePasswordRequest updatePasswordRequest) {
        try {
            // GatewayAdaptor에 updatePassword()가 아직 없으면 추가 필요
            ResponseEntity<MemberResponse> response = gatewayAdaptor.updatePassword(mbNo, updatePasswordRequest);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("비밀번호 변경 실패", e);
        }
    }

//    @Override
//    public void logout(String accessToken) {
//        try {
//            gatewayAdaptor.logout(accessToken);
//        } catch (Exception e){
//            throw new RuntimeException("로그아웃 실패했습니다.");
//        }
//
//    }
}
