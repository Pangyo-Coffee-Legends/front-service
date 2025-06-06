package com.nhnacademy.frontservice.dto.place;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 장소 등록 요청 DTO.
 * 장소명과(필수), 평면도 이미지 경로(선택)를 입력받습니다.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceRequest {

    /**
     * 장소명 (예: '1층', '2층')
     */
    String placeName;

    /**
     * 평면도 이미지 경로 (예: '/images/floor1.png')
     */
    String imagePath;
}
