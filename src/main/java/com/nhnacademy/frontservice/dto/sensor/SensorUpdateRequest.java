package com.nhnacademy.frontservice.dto.sensor;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 센서 정보 수정 요청을 위한 DTO입니다.
 * <p>
 * 센서 이름과 센서 타입 정보를 포함합니다.
 * </p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorUpdateRequest {

    /**
     * 센서 이름
     */
    String sensorName;

    /**
     * 센서 타입
     */
    String sensorType;
}