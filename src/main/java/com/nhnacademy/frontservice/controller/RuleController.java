package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.adaptor.RuleAdaptor;
import com.nhnacademy.frontservice.dto.rule.RuleRegisterRequest;
import com.nhnacademy.frontservice.dto.rule.RuleResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Slf4j
@Controller
@RequestMapping("/rules")
@RequiredArgsConstructor
public class RuleController {
    private static final String RULE_REGISTER_RESPONSE_ATTRIBUTE = "ruleResponse";

    private final RuleAdaptor ruleAdaptor;

    @GetMapping
    public String showRulesIndex() {
        log.debug("rule index page");
        return "rule/index";
    }

    @RequestMapping("/register.do")
    public String register() {
        log.debug("rule register page");

        return "rule/register";
    }

    @PostMapping
    public String registerRule(@Validated RuleRegisterRequest ruleRegisterRequest, RedirectAttributes redirectAttributes) {

        RuleResponse ruleResponse = ruleAdaptor.registerRule(ruleRegisterRequest).getBody();
        redirectAttributes.addFlashAttribute(RULE_REGISTER_RESPONSE_ATTRIBUTE, ruleResponse);

        log.debug("registerRule 저장 : {}", ruleResponse);

        return "redirect:/rule/register.do";
    }
}
