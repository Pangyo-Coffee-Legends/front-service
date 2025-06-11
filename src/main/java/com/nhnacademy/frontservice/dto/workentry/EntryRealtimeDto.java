package com.nhnacademy.frontservice.dto.workentry;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EntryRealtimeDto {
    private String time; // yyyy-MM-dd HH:mm
    private int count;
}
