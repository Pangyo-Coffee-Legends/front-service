package com.nhnacademy.frontservice.dto.rule;

import lombok.Value;

import java.time.LocalDateTime;

/**
 * 쾌적도 정보를 담아서 보내는 DTO 클래스
 */
@Value
public class ComfortInfoDto {
    /**
     * 장소
     */
    String location;

    /**
     * 현재 시간
     */
    LocalDateTime currentTime;

    /**
     * 쾌적지수
     */
    Double comfortIndex;

    /**
     * 쾌적지수 등급
     */
    String comfortGrade;
}
