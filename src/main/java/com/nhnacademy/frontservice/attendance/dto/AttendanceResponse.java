package com.nhnacademy.frontservice.attendance.dto;

import com.nhnacademy.frontservice.attendance.entity.Attendance;
import com.nhnacademy.frontservice.dto.MemberResponse;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 출결 정보 조회 응답 DTO입니다.
 */
@NoArgsConstructor
public class AttendanceResponse {
    private Long id;
    private Long mbNo;
    private String mbName; // 멤버 이름 (FeignClient 통해 가져옴)
    private LocalDateTime workDate;
    private LocalDateTime inTime;
    private LocalDateTime outTime;
    private String statusDescription;

    public AttendanceResponse(Long id, Long mbNo, String mbName, LocalDateTime workDate,
                              LocalDateTime inTime, LocalDateTime outTime, String statusDescription) {
        this.id = id;
        this.mbNo = mbNo;
        this.mbName = mbName;
        this.workDate = workDate;
        this.inTime = inTime;
        this.outTime = outTime;
        this.statusDescription = statusDescription;
    }

    /**
     * Attendance + Member 정보를 기반으로 DTO로 변환합니다.
     *
     * @param attendance Attendance 엔티티
     * @param member MemberResponse (Feign으로 조회)
     * @return AttendanceResponse DTO
     */
    public static AttendanceResponse from(Attendance attendance, MemberResponse member) {
        return new AttendanceResponse(
                attendance.getId(),
                attendance.getMbNo(),
                member.getMbName(), // name 필드는 MemberResponse에 있어야 함
                attendance.getWorkDate(),
                attendance.getInTime(),
                attendance.getOutTime(),
                attendance.getStatus().getDescription()
        );
    }

    public Long getId() {
        return id;
    }
    public Long getMbNo() {
        return mbNo;
    }

    public String getMbName() {
        return mbName;
    }

    public LocalDateTime getWorkDate() {
        return workDate;
    }

    public LocalDateTime getInTime() {
        return inTime;
    }

    public LocalDateTime getOutTime() {
        return outTime;
    }

    public String getStatusDescription() {
        return statusDescription;
    }
}
