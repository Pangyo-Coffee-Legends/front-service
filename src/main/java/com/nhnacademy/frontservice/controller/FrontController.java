package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.dto.meetingroom.MeetingRoomResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@RequiredArgsConstructor
public class FrontController {

    private final GatewayAdaptor gatewayAdaptor;

    @GetMapping( {"/index"})
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

    @GetMapping(value = "/meeting-rooms") // 회의실 목록
    public String meetingRooms() {
        return "index/meeting-room/meeting-rooms";
    }

    @GetMapping(value = "/meeting-rooms/{room-no}/bookings")
    public String meetingRoomBookings(@PathVariable("room-no") Long no, @CookieValue(name = "accessToken", required = false) String accessToken, Model model) {

        model.addAttribute("no", no);

        String authHeader = "Bearer " + accessToken;
        MeetingRoomResponse meetingRoomResponse = gatewayAdaptor.getMeetingRoomById(no, authHeader).getBody();

        if (meetingRoomResponse != null) {
            model.addAttribute("roomName", meetingRoomResponse.getMeetingRoomName());
        }

        return "index/meeting-room/meeting-room-bookings";
    }
  
    @GetMapping("/analysis")//근태 gemini 사용
    public String analysis(){return "index/work-entry/analysis";}
}
