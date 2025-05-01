package com.nhnacademy.frontservice.service.impl;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.dto.attendance.AttendanceDto;
import com.nhnacademy.frontservice.dto.attendance.AttendanceSummaryDto;
import com.nhnacademy.frontservice.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * AttendanceService 인터페이스 구현체입니다.
 * 출결 조회 및 요약 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final GatewayAdaptor gatewayAdaptor;

    /**
     * 특정 회원의 지정된 기간 동안 출결 데이터를 조회합니다.
     *
     * @param mbNo 회원 번호
     * @param start 조회 시작 시간
     * @param end 조회 종료 시간
     * @return 조회된 출결 목록
     */
    @Override
    public List<AttendanceDto> getAttendanceByNoAndDateRange(Long mbNo, LocalDateTime start, LocalDateTime end) {
        try {
            ResponseEntity<List<AttendanceDto>> response = gatewayAdaptor.getAttendanceByNoAndDateRange(mbNo, start, end);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("출결 조회 실패", e);
        }
    }

    /**
     * 최근 7일 동안의 출결 요약 데이터를 조회합니다.
     *
     * @return 최근 출결 요약 목록
     */
    @Override
    public List<AttendanceDto> getRecentAttendanceSummary() {
        try {
            ResponseEntity<List<AttendanceDto>> response = gatewayAdaptor.getRecentAttendanceSummary();
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("최근 출결 요약 조회 실패", e);
        }
    }

    @Override
    public List<AttendanceSummaryDto> getRecentWorkingHoursByMember(Long no) {
        try{
            ResponseEntity<List<AttendanceSummaryDto>> response = gatewayAdaptor.getRecentWorkingHoursByMember(no);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("최근 근무 시간 조회 실패",e);
        }
    }
}
