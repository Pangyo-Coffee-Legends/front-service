package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.service.impl.MemberServiceImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

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
        return "booking/my/history";
    }

    @GetMapping("/booking/statistics")
    public String bookingStatistics() {
        return "booking/my/statistics";
    }

    @GetMapping("/admin/booking/statistics")
    public String adminBookingStatistics() {
        return "booking/admin/statistics";
    }

    @GetMapping("/meeting/alert")
    public String meetingAlert(){
        return "meeting/extend-end";
    }

    @GetMapping("/admin/booking")
    public String bookAdmin(){
        return "booking/admin/history";
    }

    @GetMapping( "/charts")
    public String charts() { return "index/charts";}

    @GetMapping("/users")
    public String chatPage(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        model.addAttribute("userEmail", userEmail);

        System.out.println("1234" + userEmail);
        return "index/users";
    }

    @GetMapping("/stompChatPage/{roomId}")
    public String stompChatPage(Model model, @PathVariable Long roomId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        String jwtToken = auth.getCredentials().toString();

        model.addAttribute("roomId", roomId);
        model.addAttribute("userEmail", userEmail);
        model.addAttribute("jwtToken", jwtToken);
        System.out.println("1234" + userEmail);
        System.out.println("12345"+jwtToken);

        return "index/stompChatPage";
    }

    @GetMapping("/chatList")
    public String chatList(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        model.addAttribute("userEmail", userEmail);

        System.out.println("1234" + userEmail);
        return "index/chatList";
    }

    @GetMapping("/weekly-entry-charts") //월간 출입 차트 조회
    public String monthlyEntryCharts(){
        return "index/work-entry/weekly-entry-chart";
    }

    @GetMapping("/working-hours-statistics")// 근무시간통계
    public String workingHoursStatistics(){
        return "index/work-entry/working-hours-statistics";
    }

    @GetMapping("/real-time")//실시간 출입 현황
    public String realTime(){
        return "index/work-entry/real-time";
    }

    @GetMapping("/analysis")//근태 gemini 사용
    public String analysis(){return "index/work-entry/analysis";}
}
