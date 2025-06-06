package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.place.PlaceRequest;
import com.nhnacademy.frontservice.dto.place.PlaceResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@FeignClient(
        name = "iot-place-service",
        url = "${image-service.url}",
        path = "/api/v1/places"
)
public interface PlaceAdaptor {

    @GetMapping("/names")
    ResponseEntity<List<String>> getAllPlaceNames();

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<PlaceResponse> registerPlace (
            @RequestPart("place") PlaceRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file);

    @PutMapping(value = "/{placeNo}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<PlaceResponse> updatePlace (
            @PathVariable Long placeNo,
            @RequestPart("place") PlaceRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file);

    @DeleteMapping("/{placeNo}")
    ResponseEntity<Void> deletePlace(@PathVariable Long placeNo);

    @GetMapping("/{placeNo}")
    ResponseEntity<PlaceResponse> getPlace(@PathVariable Long placeNo);

    @GetMapping("/name")
    ResponseEntity<PlaceResponse> getAllPlaceName(@RequestParam String name);

    @GetMapping
    ResponseEntity<List<PlaceResponse>> getAllPlaces();
}
