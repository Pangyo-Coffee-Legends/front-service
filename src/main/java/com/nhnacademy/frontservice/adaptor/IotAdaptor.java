package com.nhnacademy.frontservice.adaptor;


import com.nhnacademy.frontservice.dto.iot.SensorCreateRequestDto;
import com.nhnacademy.frontservice.dto.iot.SensorResponseDto;

/**
 * IoT 백엔드와 통신하기 위한 어댑터 인터페이스입니다.
 * REST API 호출을 추상화하여 프론트 서비스가 사용할 수 있도록 합니다.
 */
public interface IotAdaptor {
    //포트 10266
    /**
     * 센서를 등록합니다.
     *
     * @param dto 센서 등록 요청 데이터
     * @return 등록된 센서 정보
     */
    SensorResponseDto createSensor(SensorCreateRequestDto dto);

    /**
     * 센서를 고유 번호로 조회합니다.
     *
     * @param sensorNo 센서 고유 번호
     * @return 센서 정보
     */
    SensorResponseDto getSensor(Long sensorNo);
}
