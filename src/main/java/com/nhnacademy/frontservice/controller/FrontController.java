package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.dto.MemberRegisterRequest;
import com.nhnacademy.frontservice.service.MemberService;
import com.nhnacademy.frontservice.service.impl.MemberServiceImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class FrontController {

    private final MemberServiceImpl memberService;

    public FrontController(MemberServiceImpl memberService) {
        this.memberService = memberService;
    }

    @GetMapping(value = {"/index"})
    public String index(){
        // Gateway에서 JWT 유효성 검증이 된 후 돌아오는 데이터의 값을 @ModelAttribute 또는 front-service에서 확인할 수 있는 형태의 데이터를 parameter로 받아서
        // 본 method 내에서 null/false 등 검증 후 검증 실패 시 exception을 발생시켜 exception 내에서 login page로 리다이렉트

        // 예)
        // if (aaa == null) {
        //    throw new Exception();
        // }

        return "index/index";
    }

    @GetMapping("/login")
    public String showLoginPage() {
        return "index/login";
    }

    @GetMapping("/signup")
    public String showSignupPage() {
        return "index/signup";
    }

    @GetMapping("/")
    public String randing(){return "index/landing";}


    @GetMapping(value = {"/charts"})
    public String charts() { return "index/charts";}

//    @PostMapping("/register")
//    public String register() {
//        return "index/users";
//    }

    @GetMapping("/users")
    public String chatPage(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        model.addAttribute("userEmail", userEmail);

        System.out.println("1234" + userEmail);
        return "index/users";
    }
}
