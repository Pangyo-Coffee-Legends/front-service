package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.meetingroom.MeetingRoomRegisterRequest;
import com.nhnacademy.frontservice.dto.meetingroom.MeetingRoomResponse;
import com.nhnacademy.frontservice.dto.meetingroom.MeetingRoomUpdateRequest;
import com.nhnacademy.frontservice.dto.member.*;
import com.nhnacademy.frontservice.dto.token.JwtIssueRequest;
import com.nhnacademy.frontservice.dto.token.JwtResponse;
import com.nhnacademy.frontservice.dto.token.TokenRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


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
    @GetMapping("/members/email/{mbEmail}?view=detailed")
    ResponseEntity<MemberResponse> getMemberByMbEmail(@PathVariable("mbEmail") String email);

    /**
     *
     * @param id 회의실 id
     * @param authHeader Gateway에서 식별할 인증된 사용자 정보
     * @return 회의실 DTO
     */
    @GetMapping("/meeting-rooms/{meeting-room-id}")
    ResponseEntity<MeetingRoomResponse> getMeetingRoomById(@PathVariable("meeting-room-id") Long id, @RequestHeader("Authorization") String authHeader);

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
     *
     * @param bookingNo 예약번호
     * @return 해당 예약번호 정보 DTO
     */
    @GetMapping("/bookings/{booking-no}")
    ResponseEntity<JwtResponse> getBooking(@PathVariable("booking-no") Long bookingNo, @RequestHeader("Authorization") String authHeader);

    /**
     *
     * @param bookingNo 예약 번호
     * @return 예약 연장 성공 시 새로 연장된 예약 DTO 반환
     */
    @PutMapping("/bookings/{booking-no}/extend")
    ResponseEntity<JwtResponse> extendBooking(@PathVariable("booking-no") Long bookingNo);

    /**
     *
     * @param bookingNo 예약 번호
     * @return 예약 종료 성공 시 Http Status 200 응답 반환
     */
    @PutMapping("/bookings/{booking-no}/finish")
    ResponseEntity<Void> finishBooking(@PathVariable("booking-no") Long bookingNo);
}
