package com.nhnacademy.frontservice.dto.sensor;

import com.nhnacademy.frontservice.dto.rule.RuleEvaluationResult;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorResult {
    String sensorName;
    String location;
    String status; // "ON" 또는 "OFF"
}
