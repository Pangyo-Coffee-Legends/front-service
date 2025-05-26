package com.nhnacademy.frontservice.controller;

import com.nhnacademy.frontservice.adaptor.SensorAdaptor;
import com.nhnacademy.frontservice.dto.sensor.SensorRegisterRequest;
import com.nhnacademy.frontservice.dto.sensor.SensorResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sensors")
@RequiredArgsConstructor
public class SensorController {

    private final SensorAdaptor sensorAdaptor;

    /**
     * 특정 장소(location) 기준으로 센서 조회
     */
    @GetMapping(params = "location")
    public List<SensorResponse> getSensorsByLocation(@RequestParam("location") String location) {
        return sensorAdaptor.getSensors(location).getBody();
    }

    /**
     * 전체 센서 목록 조회
     */
    @GetMapping
    public List<SensorResponse> getAllSensors() {
        return sensorAdaptor.getAllSensors().getBody();  // 반드시 이렇게
    }

    /**
     * 센서 등록
     */
    @PostMapping
    public ResponseEntity<SensorResponse> registerSensor(@RequestBody SensorRegisterRequest request) {
        return sensorAdaptor.registerSensor(request);
    }
}
