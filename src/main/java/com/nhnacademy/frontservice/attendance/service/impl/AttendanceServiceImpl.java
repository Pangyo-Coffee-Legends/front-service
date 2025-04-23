package com.nhnacademy.frontservice.attendance.service.impl;

import com.nhnacademy.frontservice.adaptor.GatewayAdaptor;
import com.nhnacademy.frontservice.attendance.dto.AttendanceResponse;
import com.nhnacademy.frontservice.attendance.entity.Attendance;
import com.nhnacademy.frontservice.attendance.repository.AttendanceRepository;
import com.nhnacademy.frontservice.attendance.service.AttendanceService;
import com.nhnacademy.frontservice.dto.MemberResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 출결 정보 처리 서비스 구현 클래스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final GatewayAdaptor gatewayAdaptor;

    /**
     * 특정 회원의 전체 출결 기록 조회
     *
     * @param mbNo 회원 번호
     * @return 출결 응답 DTO 리스트
     */
    @Override
    public List<AttendanceResponse> getAttendanceByMbNo(Long mbNo) {
        log.info("전체 출결 조회 요청: mbNo={}", mbNo);

        List<Attendance> attendanceList = attendanceRepository.findAllByMbNo(mbNo);

        log.debug("조회된 출결 수: {}", attendanceList.size());

        return attendanceList.stream()
                .map(att -> new AttendanceResponse(
                        att.getId(),
                        att.getMbNo(),
                        att.getMbName(),
                        att.getWorkDate(),
                        att.getInTime(),
                        att.getOutTime(),
                        att.getStatus().getDescription()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 특정 회원의 기간별 출결 기록 조회
     *
     * @param mbNo 회원 번호
     * @param start 시작 날짜/시간
     * @param end 종료 날짜/시간
     * @return 출결 응답 DTO 리스트
     */
    @Override
    public List<AttendanceResponse> getAttendanceByMbNoAndDateRange(Long mbNo, LocalDateTime start, LocalDateTime end) {
        log.info("기간별 출결 조회 요청: mbNo={}, from={} to={}", mbNo, start, end);

        List<Attendance> records = attendanceRepository.findByMbNoAndWorkDateBetween(mbNo, start, end);
        log.debug("조회된 출결 수: {}", records.size());

        MemberResponse member = gatewayAdaptor.getMemberByMbNo(mbNo).getBody();
        if (member == null) {
            log.warn("회원 정보 조회 실패: mbNo={}", mbNo);
            return List.of();
        }

        return records.stream()
                .map(att -> AttendanceResponse.from(att, member))
                .collect(Collectors.toList());
    }

    /**
     * 최근 7일간 전체 회원의 출결 기록 요약 조회
     *
     * @return 출결 응답 DTO 리스트
     */
    @Override
    public List<AttendanceResponse> getRecentAttendanceSummary() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekAgo = now.minusDays(7);

        log.info("최근 7일간 출결 요약 조회: 기간 {} ~ {}", weekAgo.toLocalDate(), now.toLocalDate());

        List<Attendance> records = attendanceRepository.findByWorkDateBetween(weekAgo, now);
        log.debug("총 출결 기록 수: {}", records.size());

        return records.stream()
                .map(att -> {
                    MemberResponse member = gatewayAdaptor.getMemberByMbNo(att.getMbNo()).getBody();
                    if (member == null) {
                        log.warn("회원 정보 조회 실패: mbNo={}", att.getMbNo());
                        return null;
                    }
                    return AttendanceResponse.from(att, member);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}
