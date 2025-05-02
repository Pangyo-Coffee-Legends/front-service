package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.attendance.AttendanceDto;
import com.nhnacademy.frontservice.dto.attendance.AttendanceSummaryDto;
import com.nhnacademy.frontservice.dto.member.*;
import com.nhnacademy.frontservice.dto.token.JwtIssueRequest;
import com.nhnacademy.frontservice.dto.token.JwtResponse;
import com.nhnacademy.frontservice.dto.token.TokenRequest;
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
}
