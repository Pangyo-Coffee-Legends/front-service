package com.nhnacademy.frontservice.dto;

import lombok.Value;

import java.time.LocalDateTime;

/**
 * 출결 정보 조회 응답 DTO입니다.
 */
@Value
public class AttendanceDto {
    Long id;
    Long no;
    String name; // 멤버 이름 (FeignClient 통해 가져옴)
    LocalDateTime workDate;
    LocalDateTime inTime;
    LocalDateTime outTime;
    String statusDescription;


}
