package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.dto.*;
import com.nhnacademy.frontservice.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 회원(Member)에 대한 HTTP 요청을 처리하는 컨트롤러 클래스입니다.
 * <p>
 * 회원 등록, 조회, 수정, 탈퇴 기능을 RESTful API 형태로 제공합니다.
 * URI 및 HTTP 메서드 규약에 따라 설계되어 있으며, 클라이언트-서버 간 명확한 역할 구분을 지원합니다.
 * </p>
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    /**
     * 새로운 회원을 등록합니다.
     *
     * @param request 회원 등록 요청 정보를 담은 DTO
     * @return 등록된 회원의 상세 정보가 담긴 ResponseEntity (HTTP 201 Created)
     */
    @PostMapping
    public ResponseEntity<MemberResponse> registerMember(@RequestBody @Valid MemberRegisterRequest request) {
        log.debug("Request from front-service has arrived! {}", request);
        MemberResponse response = memberService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 회원 고유 번호로 특정 회원의 정보를 조회합니다.
     *
     * @param mbEmail 조회할 회원의 고유 번호 (PathVariable)
     * @return 해당 회원의 정보가 담긴 ResponseEntity (HTTP 200 OK)
     */
    @GetMapping("/email/{mbEmail}")
    public ResponseEntity<MemberResponse> getMemberByEmail(@PathVariable String mbEmail) {
        MemberResponse response = memberService.getMbEmail(mbEmail);

        return ResponseEntity.ok(response);
    }

    /**
     * 회원 정보를 수정합니다.
     * <p>
     * 회원 이름, 이메일, 비밀번호, 전화번호 등의 정보를 업데이트합니다.
     * </p>
     *
     * @param request 수정할 회원 정보를 담은 DTO
     * @return 수정된 회원 정보가 담긴 ResponseEntity (HTTP 200 OK)
     */
    @PutMapping("/{mbNo}")
    public ResponseEntity<MemberResponse> updateMember(@PathVariable Long mbNo,@RequestBody @Valid MemberUpdateRequest request) {
        MemberResponse response = memberService.updateMember(mbNo,request);

        return ResponseEntity.ok(response);
    }

    /**
     * 회원을 탈퇴(소프트 삭제) 처리합니다.
     * <p>
     * 실제 데이터 삭제는 아니며, withdrawnAt 필드를 통해 탈퇴 상태를 표시합니다.
     * </p>
     *
     * @param mbNo 탈퇴할 회원의 고유 번호 (PathVariable)
     * @return 내용 없는 응답 ResponseEntity (HTTP 204 No Content)
     */
    @DeleteMapping("/{mbNo}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long mbNo) {
        memberService.deleteMember(mbNo);

        return ResponseEntity.noContent().build();
    }

    /**
     * 회원의 비밀번호를 업데이트합니다.
     * <p>
     * 기존 비밀번호를 확인하고, 새로운 비밀번호가 유효한지 체크한 후, 비밀번호를 변경합니다.
     * </p>
     *
     * @param mbNo 회원의 고유 번호 (PathVariable)
     * @param request 비밀번호 업데이트에 필요한 정보 (새로운 비밀번호, 기존 비밀번호 등)
     * @return 내용 없는 응답 ResponseEntity (HTTP 204 No Content)
     */
    @PutMapping("/{mbNo}/password")
    public ResponseEntity<Void> updatePassword(
            @PathVariable Long mbNo,
            @RequestBody @Valid MemberUpdatePasswordRequest request){
        memberService.updatePassword(mbNo, request);

        return ResponseEntity.noContent().build();
    }
    @GetMapping("/info-list")
    ResponseEntity<List<MemberInfoResponse>> getMemberInfoList() {
        List<MemberInfoResponse> memberInfoList = memberService.getMemberInfoList();
        return ResponseEntity.ok(memberInfoList);
    }
}
