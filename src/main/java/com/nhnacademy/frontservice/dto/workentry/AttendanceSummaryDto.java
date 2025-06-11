package com.nhnacademy.frontservice.dto.workentry;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Value;

import java.time.LocalDateTime;

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

    LocalDateTime inTime;

    LocalDateTime outTime;

    @JsonProperty("code")
    Long code;
}
