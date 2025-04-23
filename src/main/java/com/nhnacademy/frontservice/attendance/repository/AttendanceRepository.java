package com.nhnacademy.frontservice.attendance.repository;

import com.nhnacademy.frontservice.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    /**
     * 특정 회원의 전체 출결 기록 조회
     *
     * @param mbNo 회원 번호
     * @return 출결 엔티티 리스트
     */
    List<Attendance> findAllByMbNo(Long mbNo);

    /**
     * 특정 회원의 기간별 출결 기록 조회
     *
     * @param mbNo 회원 번호
     * @param workDate 시작일
     * @param workDate2 종료일
     * @return 출결 엔티티 리스트
     */
    List<Attendance> findByMbNoAndWorkDateBetween(Long mbNo, LocalDateTime workDate, LocalDateTime workDate2);

    /**
     * 전체 회원의 특정 기간 출결 기록 조회
     *
     * @param start 시작일
     * @param end 종료일
     * @return 출결 엔티티 리스트
     */
    List<Attendance> findByWorkDateBetween(LocalDateTime start, LocalDateTime end);
}
