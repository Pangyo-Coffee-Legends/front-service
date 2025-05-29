package com.nhnacademy.frontservice.dto.comfort;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 쾌적도 정보를 담아서 보내는 DTO 클래스
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComfortInfoDTO {
    /**
     * 장소
     */
    String location;

    /**
     * 온도
     */
    Double temperature;

    /**
     * 습도
     */
    Double humidity;

    /**
     * co2
     */
    Double co2;

    /**
     * ai 온도, 습도 설명
     */
    @JsonProperty("comport-index")
    String comportIndex;

    /**
     * ai co2 설명
     */
    @JsonProperty("co2-comment")
    String co2Comment;
}
