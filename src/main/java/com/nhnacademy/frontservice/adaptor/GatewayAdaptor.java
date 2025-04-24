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

// feignclient interceptor: 동작 전 후 시점에 동작하는 interceptor 만들 수 있음. (참고만)
@FeignClient(name = "gateway-service", url = "http://localhost:10251", path = "/api/v1")
public interface GatewayAdaptor {

    @PostMapping("/members")
    ResponseEntity<MemberResponse> registerMember(@RequestBody MemberRegisterRequest registerRequest);

    @GetMapping("/members/email/{mbEmail}")
    ResponseEntity<MemberResponse> getMemberByMbEmail(@PathVariable("mbEmail") String email);

    @PostMapping("/token")
    ResponseEntity<JwtResponse> getJwtToken(@RequestBody JwtIssueRequest jwtIssueRequest);
}
