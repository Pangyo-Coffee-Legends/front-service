package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.dto.member.*;
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
     * @param request 회원 등록 요청 정보
     * @return 등록된 회원의 정보 (HTTP 201 Created)
     */
    @PostMapping
    public ResponseEntity<MemberResponse> registerMember(@RequestBody @Valid MemberRegisterRequest request) {
        log.debug("Request from front-service has arrived! {}", request);
        MemberResponse response = memberService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 이메일로 회원 정보를 조회합니다.
     *
     * @param mbEmail 조회할 회원 이메일
     * @return 해당 회원의 정보 (HTTP 200 OK)
     */
    @GetMapping("/email/{mbEmail}")
    public ResponseEntity<MemberResponse> getMemberByEmail(@PathVariable String mbEmail) {
        MemberResponse response = memberService.getMbEmail(mbEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * 회원 정보를 수정합니다.
     *
     * @param mbNo    수정할 회원의 고유 번호
     * @param request 수정할 회원 정보
     * @return 수정된 회원의 정보 (HTTP 200 OK)
     */
    @PutMapping("/{mbNo}")
    public ResponseEntity<MemberResponse> updateMember(@PathVariable Long mbNo,@RequestBody @Valid MemberUpdateRequest request) {
        MemberResponse response = memberService.updateMember(mbNo,request);
        return ResponseEntity.ok(response);
    }

    /**
     * 회원을 탈퇴(소프트 삭제) 처리합니다.
     *
     * @param mbNo 탈퇴할 회원의 고유 번호
     * @return 내용 없는 응답 (HTTP 204 No Content)
     */
    @DeleteMapping("/{mbNo}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long mbNo) {
        memberService.deleteMember(mbNo);
        return ResponseEntity.noContent().build();
    }

    /**
     * 회원의 비밀번호를 업데이트합니다.
     *
     * @param mbNo    비밀번호를 변경할 회원의 고유 번호
     * @param request 비밀번호 변경 요청 정보
     * @return 내용 없는 응답 (HTTP 204 No Content)
     */
    @PutMapping("/{mbNo}/password")
    public ResponseEntity<Void> updatePassword(
            @PathVariable Long mbNo,
            @RequestBody @Valid MemberUpdatePasswordRequest request){
        memberService.updatePassword(mbNo, request);
        return ResponseEntity.noContent().build();
    }

    /**
     * 전체 회원의 요약 정보를 조회합니다.
     *
     * @return 회원 요약 정보 리스트 (HTTP 200 OK)
     */
    @GetMapping("/info-list")
    public ResponseEntity<List<MemberInfoResponse>> getMemberInfoList() {
        List<MemberInfoResponse> memberInfoList = memberService.getMemberInfoList();
        return ResponseEntity.ok(memberInfoList);
    }
}
