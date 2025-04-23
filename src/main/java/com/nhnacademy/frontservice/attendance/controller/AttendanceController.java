package com.nhnacademy.frontservice.attendance.controller;

import com.nhnacademy.frontservice.attendance.dto.AttendanceResponse;
import com.nhnacademy.frontservice.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 출결 관련 REST API 컨트롤러입니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/attendances")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/{mbNo}")
    public List<AttendanceResponse> getAttendanceByMbNo(
            @PathVariable Long mbNo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        log.info("🔍 회원 {}의 출결 조회 요청: {} ~ {}", mbNo, start, end);
        List<AttendanceResponse> result = attendanceService.getAttendanceByMbNoAndDateRange(mbNo, start, end);
        log.debug("조회된 출결 수: {}", result.size());

        return result;
    }

    @GetMapping("/summary/recent")
    public List<AttendanceResponse> getRecentAttendanceSummary() {
        log.info("📊 최근 7일 출결 요약 요청");
        List<AttendanceResponse> result = attendanceService.getRecentAttendanceSummary();
        log.debug("요약된 출결 수: {}", result.size());

        return result;
    }
}
