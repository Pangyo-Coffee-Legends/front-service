package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.common.adaptor.WorkEntryAdaptor;
import com.nhnacademy.frontservice.dto.PageResult;
import com.nhnacademy.frontservice.dto.workentry.AttendanceDto;
import com.nhnacademy.frontservice.dto.workentry.AttendanceSummaryDto;
import com.nhnacademy.frontservice.dto.workentry.EntryCountDto;
import com.nhnacademy.frontservice.dto.workentry.EntryRealtimeDto;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping(("/api/v1"))
@RequiredArgsConstructor
public class WorkEntryController {
    private final WorkEntryAdaptor workEntryAdaptor;

    @GetMapping("/entries/weekly")
    @ResponseStatus(HttpStatus.OK)
    public List<EntryCountDto> getMonthlyEntryCounts() {
        return workEntryAdaptor.getMonthlyEntryCounts();
    }

    @GetMapping(value = {"/entries/real-time"})
    @ResponseStatus(HttpStatus.OK)
    public EntryRealtimeDto getRealtimeEntry() {
        return workEntryAdaptor.getRealtimeEntry();
    }

    @GetMapping("/attendances/{no}")
    @ResponseStatus(HttpStatus.OK)
    PageResult<AttendanceDto> getAttendanceByNo(
            @PathVariable Long no,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(value = "page", defaultValue = "1") int page) {
        return workEntryAdaptor.getAttendanceByNo(no, start, end, page);
    }

    @GetMapping("/attendances/summary/recent/{no}")
    @ResponseStatus(HttpStatus.OK)
    public PageResult<AttendanceSummaryDto> getRecentWorkingHoursByMember( @PathVariable Long no, @RequestParam(value = "page", defaultValue = "1") int page) {
        return workEntryAdaptor.getRecentWorkingHoursByMember(no, page);
    }
    @GetMapping("/attendances/summary/recent")
    @ResponseStatus(HttpStatus.OK)
    public PageResult<AttendanceDto> getRecentAttendanceSummary(@RequestParam(value = "page", defaultValue = "1") int page){
        return workEntryAdaptor.getRecentAttendanceSummary(page);
    }
}
