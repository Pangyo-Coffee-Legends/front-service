package com.nhnacademy.frontservice.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

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
    public String randing(){return "index/landing";}

    @GetMapping("/booking")
    public String book(){
        return "booking/index";
    }

    @GetMapping("/booking/update")
    public String updateBooking(){
        return "booking/index";
    }

    @GetMapping("/booking/success")
    public String success(){
        return "booking/success";
    }

    @GetMapping("/booking/failed")
    public String failed(){
        return "booking/failed";
    }

    @GetMapping("/booking/history")
    public String bookings(){
        return "booking/history";
    }

    @GetMapping("/meeting/alert")
    public String meetingAlert(){
        return "meeting/alert";
    }

    @GetMapping(value = {"/charts"})
    public String charts() { return "index/charts";}
}
