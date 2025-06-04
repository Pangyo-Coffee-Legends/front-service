package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.condition.ConditionRegisterRequest;
import com.nhnacademy.frontservice.dto.condition.ConditionResponse;
import jakarta.validation.Valid;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
        name = "condition-service",
        url = "${rule-service.url}",
        path = "/api/v1/conditions"
)
public interface ConditionAdaptor {
    @PostMapping
    ResponseEntity<ConditionResponse> registerCondition(@Valid @RequestBody ConditionRegisterRequest request);

    @GetMapping("/{conditionNo}")
    ResponseEntity<ConditionResponse> getCondition(@PathVariable("conditionNo") Long conditionNo);

    @GetMapping
    ResponseEntity<List<ConditionResponse>> getConditions();

    @GetMapping("/rule/{ruleNo}")
    ResponseEntity<List<ConditionResponse>> getConditionByRule(@PathVariable("ruleNo") Long ruleNo);

    @DeleteMapping("/{conditionNo}")
    ResponseEntity<Void> deleteCondition(@PathVariable("conditionNo") Long conditionNo);

    @DeleteMapping("/rule/{ruleNo}")
    ResponseEntity<Void> deleteConditionByRule(@PathVariable("ruleNo") Long ruleNo);

    @DeleteMapping("/rule/{ruleNo}/condition/{conditionNo}")
    ResponseEntity<Void> deleteConditionByRuleNoAndConditionNo(
            @PathVariable("ruleNo") Long ruleNo,
            @PathVariable("conditionNo") Long conditionNo
    );
}