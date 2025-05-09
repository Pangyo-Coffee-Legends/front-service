package com.nhnacademy.frontservice.dto.iot;

import com.nhnacademy.iot_service.dto.Sensor;

/**
 * 센서 정보를 클라이언트에 응답할 때 사용하는 DTO 클래스입니다.
 * 서버가 센서 조회 또는 등록 결과를 반환할 때 사용됩니다.
 */
public class SensorResponseDto {
    private Long sensorNo;
    private String sensorName;
    private String sensorType;
    private Boolean sensorStatus;
    private String location;

    /**
     * 모든 필드를 초기화하는 생성자입니다.
     * 서버 내부에서 Sensor 엔티티를 응답 DTO로 변환할 때 사용됩니다.
     *
     * @param sensorNo     센서 고유 번호
     * @param sensorName   센서 이름
     * @param sensorType   센서 종류
     * @param sensorStatus 센서 상태 (true: 정상, false: 비정상)
     * @param location     센서 설치 위치
     */
    public SensorResponseDto(Long sensorNo, String sensorName, String sensorType, Boolean sensorStatus, String location) {
        this.sensorNo = sensorNo;
        this.sensorName = sensorName;
        this.sensorType = sensorType;
        this.sensorStatus = sensorStatus;
        this.location = location;
    }

    /**
     * Sensor 엔티티 객체를 기반으로 SensorResponseDto를 생성하는 정적 팩토리 메서드입니다.
     *
     * @param sensor Sensor 엔티티 객체
     * @return SensorResponseDto 객체
     */
    public static SensorResponseDto from(Sensor sensor) {
        return new SensorResponseDto(
                sensor.getSensorNo(),
                sensor.getSensorName(),
                sensor.getSensorType(),
                sensor.getSensorStatus(),
                sensor.getLocation()
        );
    }

    /**
     * 센서 번호를 반환합니다.
     *
     * @return 센서 번호
     */
    public Long getSensorNo() {
        return sensorNo;
    }

    /**
     * 센서 이름을 반환합니다.
     *
     * @return 센서 이름
     */
    public String getSensorName() {
        return sensorName;
    }

    /**
     * 센서 종류를 반환합니다.
     *
     * @return 센서 종류
     */
    public String getSensorType() {
        return sensorType;
    }

    /**
     * 센서 상태를 반환합니다.
     *
     * @return 센서 상태 (true/false)
     */
    public Boolean getSensorStatus() {
        return sensorStatus;
    }

    /**
     * 센서 설치 위치를 반환합니다.
     *
     * @return 설치 위치
     */
    public String getLocation() {
        return location;
    }
}
