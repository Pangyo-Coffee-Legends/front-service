package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.comfort.ComfortInfoDTO;
import com.nhnacademy.frontservice.dto.rule.RuleEvaluationResult;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
        name = "comfort-info-service",
        url = "${rule-service.url}",
        path = "/api/v1/comfort"
)
public interface ComfortInfoAdaptor {

    @PostMapping
    void sendComfortInfo(@RequestBody ComfortInfoDTO comfortInfo);

    @GetMapping("/scheduled-result")
    List<RuleEvaluationResult> getScheduledResults();
}
