package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.comfort.ComfortInfoDto;
import com.nhnacademy.frontservice.dto.comfort.RuleEvaluationResult;
import com.nhnacademy.frontservice.dto.comfort.RuleGroupResponse;
import com.nhnacademy.frontservice.dto.comfort.RuleResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(
        name = "rule-engine",
        contextId = "comfortAdapterRuleEngine",
        url = "${comfort-service.url}",
        path = "/api/v1"
)

public interface ComfortAdapter {

    @GetMapping("/rules")
    ResponseEntity<List<RuleResponse>> getRules();

    @GetMapping("/rule-groups")
    List<RuleGroupResponse> getRuleGroups();

    @PostMapping("/rule-engine/trigger")
    List<RuleEvaluationResult> executeTriggeredRules(
            @RequestParam("eventType") String eventType,
            @RequestParam(value = "eventParams", defaultValue = "{}") String eventParams,
            @RequestBody Map<String, Object> facts
    );

    @GetMapping("/comforts")
    List<ComfortInfoDto> getComfortInfos();
}
