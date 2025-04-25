package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "gateway-service", url = "http://localhost:10251", path = "/api/v1")
public interface GatewayAdaptor {

    @PostMapping("/members")
    ResponseEntity<MemberResponse> registerMember(@RequestBody MemberRegisterRequest registerRequest);

    @GetMapping("/members/email/{mbEmail}")
    ResponseEntity<MemberResponse> getMemberByMbEmail(@PathVariable("mbEmail") String email);

    @PostMapping("/token")
    ResponseEntity<JwtResponse> issueToken(@RequestBody JwtIssueRequest jwtIssueRequest);

    @PostMapping("/token/reissue")
    ResponseEntity<JwtResponse> reissueToken(@RequestBody TokenRequest request);
}
