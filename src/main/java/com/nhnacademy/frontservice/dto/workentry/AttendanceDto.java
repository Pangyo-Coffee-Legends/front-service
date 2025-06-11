package com.nhnacademy.frontservice.dto.workentry;


import lombok.Value;

import java.time.LocalDateTime;

/**
 * 출결 정보 조회 응답 DTO입니다.
 */
@Value
public class AttendanceDto {
    Long id;
    Long no;
    LocalDateTime workDate;
    LocalDateTime inTime;
    LocalDateTime outTime;
    String statusDescription;
}
