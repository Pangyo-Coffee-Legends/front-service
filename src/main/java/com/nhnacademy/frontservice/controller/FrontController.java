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

        return "index/comfort-dashboard";
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
        return "index/booking/index";
    }

    @GetMapping("/booking/update")
    public String updateBooking(){
        return "index/booking/index";
    }

    @GetMapping("/booking/success")
    public String success(){
        return "index/booking/success";
    }

    @GetMapping("/booking/failed")
    public String failed(){
        return "index/booking/failed";
    }

    @GetMapping("/booking/history")
    public String bookings(){
        return "index/booking/my/history";
    }

//    @GetMapping("/booking/statistics")
//    public String bookingStatistics() {
//        return "index/booking/my/statistics";
//    }

    @GetMapping("/booking/statistics")
    public String adminBookingStatistics() {
        return "index/booking/admin/statistics";
    }

    @GetMapping("/admin/booking")
    public String bookAdmin(){
        return "index/booking/admin/history";
    }

    @GetMapping("/charts")
    public String charts() { return "index/charts";}

    @GetMapping("/users")
    public String chatPage() {
        return "index/users";
    }

    @GetMapping("/stompChatPage/{roomId}")
    public String stompChatPage(Model model, @PathVariable Long roomId) {
        model.addAttribute("roomId", roomId);

        return "chat/stompChatPage";
    }

    @GetMapping("/chatList")
    public String chatList() {
        return "chat/chatList";
    }

    @GetMapping("/notification")
    public String notification() {
        return "chat/notification";
    }

    @GetMapping("/entry-charts") //주간 출입 차트 조회
    public String entryCharts(){
        return "index/work-entry/entry-chart";
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


    /**
     *
     * meeting-rooms.html에서 회의실을 선택하면 해당 회의실에 등록되어 있는 예약을 보여주는
     * 페이지로 이동하기 위해 GET 요청 발생 시 호출되는 controller method입니다.
     *
     * @param no 회의실 ID
     * @param accessToken 인증된 사용자에게 부여되는 access token
     * @param model 선택한 회의실에 등록된 예약 내역을 표시할 때 HTML에 나타낼 회의실 이름을 담아서 전달해줄 Model
     * @return 선택한 회의실에 등록되어 있는 예약내역을 보여주는 페이지로 이동합니다.
     */
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

    @GetMapping(value = "/meeting-room/{room-no}/{booking-no}/in-meeting")
    public String inMeeting(@PathVariable("room-no") Long roomNo, @PathVariable("booking-no") Long bookingNo, Model model) {

        return "index/meeting-room/in-meeting";
    }
  
    @GetMapping("/analysis")//근태 gemini 사용
    public String analysis(){return "index/work-entry/analysis";}

    @GetMapping("/comfort-dashboard")
    public String comfortDashboard() {return "index/comfort-dashboard";}

    @GetMapping("/rule-group")
    public String ruleGroup() {return "rule-group/rule-group";}

    @GetMapping("/rule")
    public String rule() {return "rule/rule";}

    @GetMapping("/action-condition")
    public String actionCondition() {return "action-condition/action-condition";}

    @GetMapping("/sensor")
    public String sensor() {return "sensor/sensor";}

    @GetMapping("/my-info")
    public String myInfo() {return "my-info/my-info";}

    @GetMapping("/my-info-change")
    public String myInfoChange() {return "my-info/my-info-change";}

}
