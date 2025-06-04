package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.adaptor.ComfortInfoAdaptor;
import com.nhnacademy.frontservice.dto.comfort.ComfortInfoDTO;
import com.nhnacademy.frontservice.dto.rule.RuleEvaluationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/comfort")
@RequiredArgsConstructor
public class ComfortInfoController {

    private final ComfortInfoAdaptor comfortInfoAdaptor;

    /**
     * 프론트에서 전달한 쾌적 지수 정보를 백엔드(rule-engine)에 전달
     */
    @PostMapping
    public ResponseEntity<Void> sendComfortInfo(@RequestBody ComfortInfoDTO comfortInfoDTO) {
        log.debug("[Front] 쾌적 정보 전달 요청: {}", comfortInfoDTO);
        comfortInfoAdaptor.sendComfortInfo(comfortInfoDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * 쾌적 지수 스케줄링 결과 조회
     */
    @GetMapping("/scheduled-result")
    public ResponseEntity<List<RuleEvaluationResult>> getScheduledResults() {
        log.debug("[Front] 스케줄링 쾌적 결과 조회 요청");
        return ResponseEntity.ok(comfortInfoAdaptor.getScheduledResults());
    }
}
