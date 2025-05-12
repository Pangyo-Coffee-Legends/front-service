package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.rule.RuleGroupRegisterRequest;
import com.nhnacademy.frontservice.dto.rule.RuleGroupResponse;
import com.nhnacademy.frontservice.dto.rule.RuleGroupUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
        name = "rule-group-service",
        url = "${rule-service.url}",
        path = "/api/v1/rule-groups"
)
public interface RuleGroupAdaptor {

    @PostMapping
    ResponseEntity<RuleGroupResponse> registerRuleGroup(@RequestBody RuleGroupRegisterRequest request);

    @GetMapping("/{ruleGroupNo}")
    ResponseEntity<RuleGroupResponse> getRuleGroup(@PathVariable Long ruleGroupNo);

    @GetMapping
    ResponseEntity<List<RuleGroupResponse>> getRuleGroups();

    @PutMapping("/{no}")
    ResponseEntity<RuleGroupResponse> updateRuleGroup(
            @PathVariable("no") Long no,
            @RequestBody RuleGroupUpdateRequest request
    );

    @DeleteMapping("/{ruleGroupNo}")
    ResponseEntity<Void> deleteRuleGroup(@PathVariable Long ruleGroupNo);
}
