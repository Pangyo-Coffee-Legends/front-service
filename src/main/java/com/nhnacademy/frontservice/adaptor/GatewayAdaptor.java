package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.JwtIssueRequest;
import com.nhnacademy.frontservice.dto.MemberResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "gateway-service", url = "http://localhost:10251")
public interface GatewayAdaptor {
    @GetMapping("/api/v1/members/{mbEmail}")
    MemberResponse findByMbEmail(@PathVariable("mbEmail") String email);

    @PostMapping("/api/v1/auth")
    ResponseEntity<Map<String, String>> getJwtToken(@RequestBody JwtIssueRequest jwtIssueRequest);
}
