package com.nhnacademy.frontservice.dto.attendance;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Value;

import java.time.LocalDateTime;

/**
 * 최근 30일 근무시간 요약 DTO
 */

@Value
public class AttendanceSummaryDto {
    @JsonProperty("year")
    int year;

    @JsonProperty("monthValue")
    int monthValue;

    @JsonProperty("dayOfMonth")
    int dayOfMonth;

    @JsonProperty("hoursWorked")
    int hoursWorked;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime inTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime outTime;

    @JsonProperty("code")
    Long code;
}
