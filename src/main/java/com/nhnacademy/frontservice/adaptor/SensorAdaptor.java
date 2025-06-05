package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.sensor.SensorRegisterRequest;
import com.nhnacademy.frontservice.dto.sensor.SensorResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(
        name = "iot-service",
        url = "http://localhost:10266",
        path = "/api/v1/sensors"
)
public interface SensorAdaptor {

    @PostMapping
    ResponseEntity<SensorResponse> registerSensor(@RequestBody SensorRegisterRequest request);

    @GetMapping("/{sensorNo}")
    ResponseEntity<SensorResponse> getSensor(@PathVariable("sensorNo") Long sensorNo);

    @GetMapping("/place/{sensorPlace}")
    ResponseEntity<List<SensorResponse>> getSensors(@PathVariable("sensorPlace") String sensorPlace);
}