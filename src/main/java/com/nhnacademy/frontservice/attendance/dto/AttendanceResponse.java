package com.nhnacademy.frontservice.attendance.dto;

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
