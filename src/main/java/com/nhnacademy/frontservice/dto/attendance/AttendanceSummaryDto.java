package com.nhnacademy.frontservice.dto.attendance;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Value;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 최근 30일 근무시간 요약 DTO
 */
@Value
public class AttendanceSummaryDto {
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate workDate;

    int hoursWorked;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime inTime;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime outTime;

    Long code;


}
