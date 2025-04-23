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
    public String landing(){return "index/landing";}

    @GetMapping(value = {"/charts"})
    public String charts() { return "index/charts";}

    @GetMapping(value = {"/monthly-entry-charts"}) //월간 출입 차트 조회
    public String monthlyEntryCharts(){
        return "index/monthly-entry-chart";
    }

    @GetMapping(value = {"/working-hours-statistics"})// 근무시간통계
    public String workingHoursStatistics(){
        return "index/working-hours-statistics";
    }

    @GetMapping(value = {"/real-time"})//실시간 출입 현황
    public String realTime(){
        return "index/real-time";
    }
}
