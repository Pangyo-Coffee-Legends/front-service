package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.dto.attendance.AttendanceDto;
import com.nhnacademy.frontservice.dto.attendance.AttendanceSummaryDto;
import com.nhnacademy.frontservice.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 출결 관련 REST API 컨트롤러입니다.
 */
/**
 * 출결 관련 REST API 컨트롤러입니다.
 * <p>
 * 회원 출결 정보 조회, 최근 출결 요약, 근무시간 통계를 제공합니다.
 * </p>
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/attendances")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    /**
     * 특정 회원의 지정된 기간(start~end) 출결 내역을 조회합니다.
     *
     * @param no    회원 번호
     * @param start 조회 시작 시각 (ISO 8601 형식)
     * @param end   조회 종료 시각 (ISO 8601 형식)
     * @return 출결 내역 리스트
     */
    @GetMapping("/{no}")
    public List<AttendanceDto> getAttendanceByNo(
            @PathVariable Long no,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {

        log.info("🔍 회원 {}의 출결 조회 요청: {} ~ {}", no, start, end);
        List<AttendanceDto> result = attendanceService.getAttendanceByNoAndDateRange(no, start, end);
        log.debug("조회된 출결 수: {}", result.size());

        return result;
    }

    /**
     * 전체 회원의 최근 30일 출결 요약을 조회합니다.
     *
     * @return 최근 출결 요약 리스트
     */
    @GetMapping("/summary/recent")
    public List<AttendanceDto> getRecentAttendanceSummary() {
        log.info("📊 최근 30일 출결 요약 요청");
        List<AttendanceDto> result = attendanceService.getRecentAttendanceSummary();
        log.debug("요약된 출결 수: {}", result.size());

        return result;
    }

    /**
     * 특정 회원의 최근 30일간 근무시간 통계를 조회합니다.
     *
     * @param no 회원 번호
     * @return 날짜별 근무시간 요약 리스트
     */
    @GetMapping("/summary/recent/{no}")
    public List<AttendanceSummaryDto> getRecentWorkingHoursByMember(@PathVariable Long no) {
        log.info("📊 회원 {} 최근 30일 근무 통계 조회 요청", no);
        List<AttendanceSummaryDto> result = attendanceService.getRecentWorkingHoursByMember(no);
        log.debug("조회된 통계 수: {}", result.size());

        return result;
    }

}
