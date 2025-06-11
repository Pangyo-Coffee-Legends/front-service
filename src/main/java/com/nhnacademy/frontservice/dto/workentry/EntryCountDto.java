package com.nhnacademy.frontservice.dto.workentry;

import lombok.Getter;

@Getter
public class EntryCountDto {
    private final String date; // yyyy-MM-dd
    private final int count;

    public EntryCountDto(String date, int count) {
        this.date = date;
        this.count = count;
    }


}
