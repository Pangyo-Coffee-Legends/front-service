package com.nhnacademy.frontservice.dto.place;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceResponse {
    Long placeNo;
    String placeName;
    String imagePath;
}
