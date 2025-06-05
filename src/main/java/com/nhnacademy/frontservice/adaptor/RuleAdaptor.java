package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.rule.RuleRegisterRequest;
import com.nhnacademy.frontservice.dto.rule.RuleResponse;
import com.nhnacademy.frontservice.dto.rule.RuleUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
        name = "rule-service",
        url = "http://localhost:10263",
        path = "/api/v1/rules"
)
public interface RuleAdaptor {

    @PostMapping
    ResponseEntity<RuleResponse> registerRule(@Valid @RequestBody RuleRegisterRequest request);

    @GetMapping("/{ruleNo}")
    ResponseEntity<RuleResponse> getRule(@PathVariable Long ruleNo);

    @GetMapping("/group/{no}")
    ResponseEntity<List<RuleResponse>> getRulesByRuleGroup(@PathVariable Long no);

    @GetMapping
    ResponseEntity<List<RuleResponse>> getRules();

    @PutMapping("/{ruleNo}")
    ResponseEntity<RuleResponse> updateRule(
            @PathVariable Long ruleNo,
            @Valid @RequestBody RuleUpdateRequest request
    );

    @DeleteMapping("/{ruleNo}")
    ResponseEntity<Void> deleteRule(@PathVariable Long ruleNo);
}