package com.nhnacademy.frontservice.dto.sensor;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorResponse {
    Long sensorNo;
    String sensorName;
    String sensorType;
    Boolean sensorStatus;
    String location;
}