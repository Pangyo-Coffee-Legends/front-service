package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.action.ActionRegisterRequest;
import com.nhnacademy.frontservice.dto.action.ActionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
        name = "action-service",
        url = "${rule-service.url}",
        path = "/api/v1/actions"
)
public interface ActionAdaptor {
    @PostMapping
    ResponseEntity<ActionResponse> registerAction(@RequestBody ActionRegisterRequest request);

    @GetMapping("/{actNo}")
    ResponseEntity<ActionResponse> getAction(@PathVariable("actNo") Long actNo);

    @GetMapping
    ResponseEntity<List<ActionResponse>> getActions();

    @GetMapping("/rule/{ruleNo}")
    ResponseEntity<List<ActionResponse>> getActionByRule(@PathVariable("ruleNo") Long ruleNo);

    @DeleteMapping("/{actNo}")
    ResponseEntity<Void> deleteAction(@PathVariable("actNo") Long actNo);

    @DeleteMapping("/rule/{ruleNo}")
    ResponseEntity<Void> deleteActionByRule(@PathVariable("ruleNo") Long ruleNo);

    @DeleteMapping("/rule/{ruleNo}/action/{actionNo}")
    ResponseEntity<Void> deleteActionsByRuleNoAndActionNo (
            @PathVariable("ruleNo") Long ruleNo,
            @PathVariable("actionNo") Long actionNo
    );
}
