package com.nhnacademy.frontservice.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontController {
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
    public String landing(){return "index/landing";}

    @GetMapping(value = {"/charts"})
    public String charts() { return "index/charts";}

    @GetMapping(value = {"/weekly-entry-charts"}) //월간 출입 차트 조회
    public String monthlyEntryCharts(){
        return "index/weekly-entry-chart";
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
