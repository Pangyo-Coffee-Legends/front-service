package com.nhnacademy.frontservice.influxdb;

import lombok.Getter;

/**
 * 날짜별 출입 횟수를 나타내는 DTO 클래스입니다.
 */
@Getter
public class EntryCountDto {
    private final String date; // yyyy-MM-dd
    private final int count;

    public EntryCountDto(String date, int count) {
        this.date = date;
        this.count = count;
    }


}

