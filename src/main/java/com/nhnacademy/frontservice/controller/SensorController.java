package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.adaptor.SensorAdaptor;
import com.nhnacademy.frontservice.dto.sensor.SensorRegisterRequest;
import com.nhnacademy.frontservice.dto.sensor.SensorResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 프론트에서 사용하는 센서 API 중계 컨트롤러.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/sensors")
@RequiredArgsConstructor
public class SensorController {

    private final SensorAdaptor sensorAdaptor;

    @PostMapping
    public ResponseEntity<SensorResponse> registerSensor(@RequestBody SensorRegisterRequest request) {
        log.debug("[Front] 센서 등록 요청: {}", request);
        return sensorAdaptor.registerSensor(request);
    }

    @GetMapping("/{sensorNo}")
    public ResponseEntity<SensorResponse> getSensor(@PathVariable("sensorNo") Long sensorNo) {
        log.debug("[Front] 센서 단건 조회: {}", sensorNo);
        return sensorAdaptor.getSensor(sensorNo);
    }

    @GetMapping("/place/{sensorPlace}")
    public ResponseEntity<List<SensorResponse>> getSensorsByPlace(@PathVariable("sensorPlace") String sensorPlace) {
        log.debug("[Front] 센서 장소 기준 조회: {}", sensorPlace);
        return sensorAdaptor.getSensors(sensorPlace);
    }
}
