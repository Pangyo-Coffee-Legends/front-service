package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * member-service와 통신하는 FeignClient입니다.
 */
@FeignClient(name = "member-service")
public interface MemberFeignClient {

    @PostMapping("/api/v1/members")
    ResponseEntity<MemberResponse> registerMember(@RequestBody MemberRegisterRequest registerRequest);

    @GetMapping("/api/v1/members/email/{mbEmail}")
    ResponseEntity<MemberResponse> getMemberByMbEmail(@PathVariable("mbEmail") String email);

    @GetMapping("/api/v1/members/{mbNo}")
    ResponseEntity<MemberInfoResponse> getMemberByNo(@PathVariable("mbNo") Long mbNo);

    @GetMapping("/api/v1/members")
    ResponseEntity<List<MemberInfoResponse>> getAllMembers();

    @PutMapping("/api/v1/members/{mbNo}")
    ResponseEntity<MemberResponse> updateMember(@PathVariable("mbNo") Long mbNo, @RequestBody MemberUpdateRequest updateRequest);

    @DeleteMapping("/api/v1/members/{mbNo}")
    ResponseEntity<MemberResponse> deleteMember(@PathVariable("mbNo") Long mbNo);

    @PutMapping("/api/v1/members/{mbNo}/password")
    ResponseEntity<MemberResponse> updatePassword(@PathVariable("mbNo") Long mbNo, @RequestBody MemberUpdatePasswordRequest updatePasswordRequest);
}
