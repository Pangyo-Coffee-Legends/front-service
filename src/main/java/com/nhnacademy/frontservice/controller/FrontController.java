package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@Controller
@RequiredArgsConstructor
public class FrontController {

    private final MemberService memberService;

    @GetMapping(value = {"/index"})
    public String index(){
        return "index/index";
    }

    @GetMapping("/login")
    public String showLoginPage() {
        return "index/login";
    }

    @PostMapping("/logout")
    public String logout(@RequestHeader("authorization") String accessToken){
        memberService.logout(accessToken);
        return "redirect:/";
    }

    @GetMapping("/signup")
    public String showSignupPage() {
        return "index/signup";
    }

    @GetMapping("/")
    public String randing(){return "index/landing";}


    @GetMapping(value = {"/charts"})
    public String charts() { return "index/charts";}
}
