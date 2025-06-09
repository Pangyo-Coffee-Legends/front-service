package com.nhnacademy.frontservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class FrontConfigController {

    @Value("${comfort.kakao.key}")
    private String kakaoKey;

    @Value("${comfort.service.key}")
    private String serviceKey;

    @GetMapping
    public ResponseEntity<Map<String, String>> getApiKeys() {
        Map<String, String> config = new HashMap<>();
        config.put("kakaoKey", kakaoKey);
        config.put("serviceKey", serviceKey);
        return ResponseEntity.ok(config);
    }
}
