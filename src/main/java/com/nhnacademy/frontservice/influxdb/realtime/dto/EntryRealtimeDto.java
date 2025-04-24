package com.nhnacademy.frontservice.influxdb.realtime.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 실시간 출입 통계 정보를 담는 DTO 클래스입니다.
 */
@Getter
@AllArgsConstructor
public class EntryRealtimeDto {
    private String time; // yyyy-MM-dd HH:mm
    private int count;
}
