package com.nhnacademy.frontservice.dto.iot;

/**
 * 센서 등록 요청을 처리하기 위한 DTO 클래스입니다.
 * 클라이언트가 서버에 센서를 생성 요청할 때 사용하는 데이터 구조입니다.
 */
public class SensorCreateRequestDto {
    private String sensorName;
    private String sensorType;
    private Boolean sensorStatus;
    private String location;

    /**
     * 기본 생성자입니다.
     * JSON 데이터를 객체로 변환할 때 Jackson 등이 사용합니다.
     */
    public SensorCreateRequestDto() {}

    /**
     * 모든 필드를 초기화하는 생성자입니다.
     *
     * @param sensorName   센서 이름
     * @param sensorType   센서 종류 (예: 온도, 습도 등)
     * @param sensorStatus 센서 상태 (true: 정상, false: 비정상)
     * @param location     센서가 설치된 위치
     */
    public SensorCreateRequestDto(String sensorName, String sensorType, Boolean sensorStatus, String location) {
        this.sensorName = sensorName;
        this.sensorType = sensorType;
        this.sensorStatus = sensorStatus;
        this.location = location;
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
     * @return 센서 상태 (true: 정상, false: 비정상)
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
