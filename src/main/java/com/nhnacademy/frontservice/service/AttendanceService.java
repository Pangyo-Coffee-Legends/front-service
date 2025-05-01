package com.nhnacademy.frontservice.service;

import com.nhnacademy.frontservice.dto.attendance.AttendanceDto;
import com.nhnacademy.frontservice.dto.attendance.AttendanceSummaryDto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 출결 관련 비즈니스 로직을 처리하는 서비스 인터페이스입니다.
 */
public interface AttendanceService {

    /**
     * 특정 회원의 특정 기간 출결 조회
     *
     * @param mbNo 회원 번호
     * @param start 조회 시작일시
     * @param end 조회 종료일시
     * @return 출결 목록
     */
    List<AttendanceDto> getAttendanceByNoAndDateRange(Long mbNo, LocalDateTime start, LocalDateTime end);

    /**
     * 최근 30일간의 출결 요약 조회
     *
     * @return 출결 요약 목록
     */
    List<AttendanceDto> getRecentAttendanceSummary();


    /**
     * 최근 30일간의 출결 요약 조회
     *
     * @return 출결 요약 목록
     */
    List<AttendanceSummaryDto> getRecentWorkingHoursByMember(Long no);

}
