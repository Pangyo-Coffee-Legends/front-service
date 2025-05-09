package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.adaptor.RuleGroupAdaptor;
import com.nhnacademy.frontservice.dto.rule.RuleGroupRegisterRequest;
import com.nhnacademy.frontservice.dto.rule.RuleGroupResponse;
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
@RequestMapping("/rule-groups")
@RequiredArgsConstructor
public class RuleGroupController {
    private static final String RULE_GROUP_REGISTER_RESPONSE_ATTRIBUTE = "ruleGroupResponse";

    private final RuleGroupAdaptor ruleGroupAdaptor;

    @GetMapping
    public String showGroupIndex() {
        log.debug("rule group index page");
        return "rule-group/index";
    }

    @RequestMapping("/register.do")
    public String register() {
        log.debug("rule group register page");

        return "rule-group/register";
    }

    @PostMapping
    public String registerRuleGroup(@Validated RuleGroupRegisterRequest request, RedirectAttributes redirectAttributes) {
        RuleGroupResponse response = ruleGroupAdaptor.registerRuleGroup(request).getBody();
        redirectAttributes.addFlashAttribute(RULE_GROUP_REGISTER_RESPONSE_ATTRIBUTE, response);

        log.debug("registerRuleGroup 저장 : {}", response);

        return "redirect:/rule/register.do";
    }
}
