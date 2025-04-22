package com.nhnacademy.frontservice.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontController {
    @GetMapping(value = {"/index"})
    public String index(){
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

    @GetMapping(value = {"/monthly-entry-charts"}) //월간 출입 차트 조회
    public String monthlyEntryCharts(){
        return "index/monthly-entry-chart";
    }
}
