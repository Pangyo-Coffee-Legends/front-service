package com.nhnacademy.frontservice.common.adaptor;

import com.nhnacademy.frontservice.dto.PageResult;
import com.nhnacademy.frontservice.dto.workentry.AttendanceDto;
import com.nhnacademy.frontservice.dto.workentry.AttendanceSummaryDto;
import com.nhnacademy.frontservice.dto.workentry.EntryCountDto;
import com.nhnacademy.frontservice.dto.workentry.EntryRealtimeDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;
import java.util.List;

@FeignClient(name = "work-entry-adaptor", url = "http://localhost:10251", path = "/api/v1")
public interface WorkEntryAdaptor {

    @GetMapping("/entries/weekly")
    List<EntryCountDto> getMonthlyEntryCounts();

    @GetMapping("/entries/realtime")
    EntryRealtimeDto getRealtimeEntry();

    @GetMapping("/attendances/{no}")
    PageResult<AttendanceDto> getAttendanceByNo(
            @PathVariable Long no,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(value = "page", defaultValue = "1") int page);

    @GetMapping("/attendances/summary/recent")
    PageResult<AttendanceDto> getRecentAttendanceSummary(@RequestParam(value = "page", defaultValue = "1") int page);

    @GetMapping("/summary/recent/{no}")
    PageResult<AttendanceSummaryDto> getRecentWorkingHoursByMember(
            @PathVariable Long no,
            @RequestParam(value = "page", defaultValue = "1") int page);
}
