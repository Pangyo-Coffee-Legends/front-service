package com.nhnacademy.frontservice.dto.iot;

import jakarta.persistence.*;
import org.hibernate.annotations.Comment;

/**
 * 센서 정보를 담는 JPA 엔티티 클래스입니다.
 * 센서 번호, 이름, 종류, 상태, 설치 장소 정보를 포함합니다.
 */
@Entity
@Table(name = "sensors")
public class Sensor {

    /**
     * 센서 고유 번호 (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    @Comment("센서 번호")
    private Long sensorNo;

    /**
     * 센서 이름
     */
    @Column(nullable = false, length = 50)
    @Comment("센서 이름")
    private String sensorName;

    /**
     * 센서 종류 (예: 온도센서, 습도센서 등)
     */
    @Column(nullable = false, length = 50)
    @Comment("센서 종류")
    private String sensorType;

    /**
     * 센서 상태 (정상 작동 여부)
     */
    @Column(nullable = false)
    @Comment("센서 상태")
    private Boolean sensorStatus;

    /**
     * 센서 설치 위치
     */
    @Column(nullable = false, length = 100)
    @Comment("설치 장소")
    private String location;

    /**
     * JPA를 위한 기본 생성자
     */
    protected Sensor() {}

    /**
     * 센서 정보를 초기화하는 생성자
     *
     * @param sensorName   센서 이름
     * @param sensorType   센서 종류
     * @param sensorStatus 센서 상태 (true: 정상, false: 비정상)
     * @param location     설치 장소
     */
    public Sensor(String sensorName, String sensorType, Boolean sensorStatus, String location) {
        this.sensorName = sensorName;
        this.sensorType = sensorType;
        this.sensorStatus = sensorStatus;
        this.location = location;
    }

    /**
     * 센서 번호 반환
     *
     * @return 센서 번호
     */
    public Long getSensorNo() {
        return sensorNo;
    }

    /**
     * 센서 이름 반환
     *
     * @return 센서 이름
     */
    public String getSensorName() {
        return sensorName;
    }

    /**
     * 센서 종류 반환
     *
     * @return 센서 종류
     */
    public String getSensorType() {
        return sensorType;
    }

    /**
     * 센서 상태 반환
     *
     * @return 센서 상태 (true/false)
     */
    public Boolean getSensorStatus() {
        return sensorStatus;
    }

    /**
     * 센서 설치 위치 반환
     *
     * @return 설치 장소
     */
    public String getLocation() {
        return location;
    }
}
