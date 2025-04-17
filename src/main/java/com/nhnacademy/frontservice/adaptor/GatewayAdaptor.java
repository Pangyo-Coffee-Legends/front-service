package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.JwtIssueRequest;
import com.nhnacademy.frontservice.dto.JwtResponse;
import com.nhnacademy.frontservice.dto.MemberRegisterRequest;
import com.nhnacademy.frontservice.dto.MemberResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "gateway-service", url = "http://localhost:10251")
public interface GatewayAdaptor {

    @PostMapping("/api/v1/members")
    ResponseEntity<MemberResponse> registerMember(@RequestBody MemberRegisterRequest registerRequest);

    @GetMapping("/api/v1/members/{mbEmail}")
    ResponseEntity<MemberResponse> getMemberByMbEmail(@PathVariable("mbEmail") String email);

    @PostMapping("/api/v1/auth")
    ResponseEntity<JwtResponse> getJwtToken(@RequestBody JwtIssueRequest jwtIssueRequest);
}
