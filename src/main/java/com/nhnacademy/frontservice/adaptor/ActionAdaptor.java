package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.rule.ActionRegisterRequest;
import com.nhnacademy.frontservice.dto.rule.ActionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @DeleteMapping("/{actNo}")
    ResponseEntity<Void> deleteAction(@PathVariable("actNo") Long actNo);
}
