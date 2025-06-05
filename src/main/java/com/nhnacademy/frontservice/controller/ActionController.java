package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.adaptor.ActionAdaptor;
import com.nhnacademy.frontservice.dto.action.ActionRegisterRequest;
import com.nhnacademy.frontservice.dto.action.ActionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/actions")
@RequiredArgsConstructor
public class ActionController {

    private final ActionAdaptor actionAdaptor;

    @GetMapping
    public ResponseEntity<List<ActionResponse>> getActions() {
        return actionAdaptor.getActions();
    }

    @GetMapping("/{actNo}")
    public ResponseEntity<ActionResponse> getAction(@PathVariable Long actNo) {
        return actionAdaptor.getAction(actNo);
    }

    @GetMapping("/rule/{ruleNo}")
    public ResponseEntity<List<ActionResponse>> getActionsByRule(@PathVariable Long ruleNo) {
        return actionAdaptor.getActionByRule(ruleNo);
    }

    @PostMapping
    public ResponseEntity<ActionResponse> register(@RequestBody ActionRegisterRequest request) {
        return actionAdaptor.registerAction(request);
    }

    @DeleteMapping("/{actNo}")
    public ResponseEntity<Void> delete(@PathVariable Long actNo) {
        return actionAdaptor.deleteAction(actNo);
    }
}
