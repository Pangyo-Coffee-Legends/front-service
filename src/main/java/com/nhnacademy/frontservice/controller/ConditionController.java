package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.adaptor.ConditionAdaptor;
import com.nhnacademy.frontservice.dto.condition.ConditionRegisterRequest;
import com.nhnacademy.frontservice.dto.condition.ConditionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/conditions")
@RequiredArgsConstructor
public class ConditionController {

    private final ConditionAdaptor conditionAdaptor;

    @GetMapping
    public ResponseEntity<List<ConditionResponse>> getConditions() {
        return conditionAdaptor.getConditions();
    }

    @GetMapping("/{conditionNo}")
    public ResponseEntity<ConditionResponse> getCondition(@PathVariable Long conditionNo) {
        return conditionAdaptor.getCondition(conditionNo);
    }

    @GetMapping("/rule/{ruleNo}")
    public ResponseEntity<List<ConditionResponse>> getConditionByRule(@PathVariable Long ruleNo) {
        return conditionAdaptor.getConditionByRule(ruleNo);
    }

    @PostMapping
    public ResponseEntity<ConditionResponse> register(@Valid @RequestBody ConditionRegisterRequest request) {
        return conditionAdaptor.registerCondition(request);
    }

    @DeleteMapping("/{conditionNo}")
    public ResponseEntity<Void> delete(@PathVariable Long conditionNo) {
        return conditionAdaptor.deleteCondition(conditionNo);
    }
}
