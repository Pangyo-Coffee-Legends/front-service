package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Gateway를 통해 member-service 및 attendance-service와 통신하는 어댑터입니다.
 */
@FeignClient(name = "gateway-service", url = "http://localhost:10251", path = "/api/v1")
public interface GatewayAdaptor {

    /**
     * 회원 등록 요청을 보냅니다.
     *
     * @param registerRequest 회원 등록 요청 데이터
     * @return 등록된 회원 정보
     */
    @PostMapping("/members")
    ResponseEntity<MemberResponse> registerMember(@RequestBody MemberRegisterRequest registerRequest);

    /**
     * 이메일을 기준으로 회원 정보를 조회합니다.
     *
     * @param email 조회할 회원 이메일
     * @return 조회된 회원 정보
     */
    @GetMapping("/members/email/{mbEmail}")
    ResponseEntity<MemberResponse> getMemberByMbEmail(@PathVariable("mbEmail") String email);

    /**
     * JWT 토큰 발급 요청을 보냅니다.
     *
     * @param jwtIssueRequest JWT 발급 요청 데이터
     * @return 발급된 JWT 토큰 정보
     */
    @PostMapping("/token")
    ResponseEntity<JwtResponse> issueToken(@RequestBody JwtIssueRequest jwtIssueRequest);

    /**
     * JWT 토큰 재발급 요청을 보냅니다.
     *
     * @param request JWT 요청 데이터
     * @return 재발급된 JWT 토큰 정보
     */
    @PostMapping("/token/reissue")
    ResponseEntity<JwtResponse> reissueToken(@RequestBody TokenRequest request);

    /**
     * 회원 번호(mbNo)를 기준으로 회원 정보를 조회합니다.
     *
     * @param no 회원 번호
     * @return 조회된 회원 정보
     */
    @GetMapping("/members/{no}")
    ResponseEntity<MemberInfoResponse> getMemberByNo(@PathVariable("no") Long no);

    /**
     * 전체 회원 목록을 조회합니다.
     *
     * @return 전체 회원 정보 목록
     */
    @GetMapping("/members")
    ResponseEntity<List<MemberInfoResponse>> getMemberInfoList();

    /**
     * 회원 정보를 수정합니다.
     *
     * @param mbNo 수정할 회원 번호
     * @param updateRequest 수정할 회원 데이터
     * @return 수정된 회원 정보
     */
    @PutMapping("/members/{mbNo}")
    ResponseEntity<MemberResponse> updateMember(@PathVariable("mbNo") Long mbNo, @RequestBody MemberUpdateRequest updateRequest);

    /**
     * 회원 탈퇴(삭제)를 수행합니다.
     *
     * @param mbNo 삭제할 회원 번호
     * @return 삭제된 회원 정보
     */
    @DeleteMapping("/members/{mbNo}")
    ResponseEntity<MemberResponse> deleteMember(@PathVariable("mbNo") Long mbNo);

    /**
     * 회원 비밀번호를 변경합니다.
     *
     * @param mbNo 회원 번호
     * @param updatePasswordRequest 비밀번호 변경 요청 데이터
     * @return 변경된 회원 정보
     */
    @PutMapping("/members/{mbNo}/password")
    ResponseEntity<MemberResponse> updatePassword(@PathVariable("mbNo") Long mbNo, @RequestBody MemberUpdatePasswordRequest updatePasswordRequest);

    /**
     * 특정 회원의 지정된 기간 동안 출결 데이터를 조회합니다.
     *
     * @param no 회원 번호
     * @param start 조회 시작 시간
     * @param end 조회 종료 시간
     * @return 조회된 출결 목록
     */
    @GetMapping("/attendances/{no}")
    ResponseEntity<List<AttendanceDto>> getAttendanceByNoAndDateRange(
            @PathVariable("no") Long no,
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    );

    /**
     * 최근 7일간의 출결 요약 데이터를 조회합니다.
     *
     * @return 최근 출결 요약 목록
     */
    @GetMapping("/attendances/summary/recent")
    ResponseEntity<List<AttendanceDto>> getRecentAttendanceSummary();
}
