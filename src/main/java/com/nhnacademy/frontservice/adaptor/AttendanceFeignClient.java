package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.config.FeignClientConfig;
import com.nhnacademy.frontservice.dto.AttendanceDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * attendance-service와 통신하는 FeignClient입니다.
 */
@FeignClient(name = "attendance-service", configuration = FeignClientConfig.class)
public interface AttendanceFeignClient {

    @GetMapping("/api/v1/attendances/{no}")
    ResponseEntity<List<AttendanceDto>> getAttendanceByNoAndDateRange(
            @PathVariable("no") Long no,
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    );

    @GetMapping("/api/v1/attendances/summary/recent")
    ResponseEntity<List<AttendanceDto>> getRecentAttendanceSummary();
}
