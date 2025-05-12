package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.rule.ConditionRegisterRequest;
import com.nhnacademy.frontservice.dto.rule.ConditionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@FeignClient(
        name = "condition-service",
        url = "${rule-service.url}",
        path = "/api/v1/conditions"
)
public interface ConditionAdaptor {
    @PostMapping
    ResponseEntity<ConditionResponse> registerCondition(@RequestBody ConditionRegisterRequest request);

    @GetMapping("/{conditionNo}")
    ResponseEntity<ConditionResponse> getCondition(@PathVariable("conditionNo") Long conditionNo);

    @DeleteMapping("/{conditionNo}")
    ResponseEntity<Void> deleteCondition(@PathVariable("conditionNo") Long conditionNo);
}
