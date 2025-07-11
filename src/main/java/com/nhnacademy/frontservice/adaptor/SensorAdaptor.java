package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.sensor.SensorRegisterRequest;
import com.nhnacademy.frontservice.dto.sensor.SensorResponse;
import com.nhnacademy.frontservice.dto.sensor.SensorResult;
import com.nhnacademy.frontservice.dto.sensor.SensorUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
        name = "iot-service",
        url = "http://localhost:10266",
        path = "/api/v1/sensors"
)
public interface SensorAdaptor {

    @PostMapping
    ResponseEntity<SensorResponse> registerSensor(@RequestBody SensorRegisterRequest request);

    @PostMapping("/send")
    void sendSensorResult(@RequestBody SensorResult result);

    @GetMapping("/{sensorNo}")
    ResponseEntity<SensorResponse> getSensor(@PathVariable("sensorNo") Long sensorNo);

    @GetMapping("/place/{sensorPlace}")
    ResponseEntity<List<SensorResponse>> getSensors(@PathVariable("sensorPlace") String sensorPlace);

    @PutMapping("/{sensorNo}")
    ResponseEntity<SensorResponse> updateSensor(@PathVariable("sensorNo") Long sensorNo,
                                                @RequestBody SensorUpdateRequest request);

    @DeleteMapping("/{sensorNo}")
    ResponseEntity<SensorResponse> deleteSensor(@PathVariable("sensorNo") Long sensorNo);
}