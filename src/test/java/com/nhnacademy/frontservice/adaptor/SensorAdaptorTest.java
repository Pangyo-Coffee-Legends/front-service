package com.nhnacademy.frontservice.adaptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhnacademy.frontservice.dto.sensor.SensorRegisterRequest;
import com.nhnacademy.frontservice.dto.sensor.SensorResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.TestPropertySource;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@AutoConfigureWireMock(port = 0)
@TestPropertySource(properties = {
        "iot-service.url=http://localhost:${wiremock.server.port}" // FeignClient가 WireMock을 바라보도록 설정
})
class SensorAdaptorTest {

    @Autowired
    private SensorAdaptor sensorAdaptor;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("센서 등록 테스트")
    void registerSensor_returnsCreatedResponse() throws Exception {
        // 1. 테스트 데이터 준비
        SensorRegisterRequest request = new SensorRegisterRequest(1L, "TempSensor-01", "heater", true, "회의실");
        SensorResponse mockResponse = new SensorResponse(1L, "TempSensor-01", "heater", true, "회의실");

        // 2. WireMock으로 API 응답 정의
        stubFor(post(urlEqualTo("/api/v1/sensors"))
                .withRequestBody(equalToJson(objectMapper.writeValueAsString(request)))
                .willReturn(aResponse()
                        .withStatus(201)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(mockResponse))));

        // 3. FeignClient 호출
        ResponseEntity<SensorResponse> response = sensorAdaptor.registerSensor(request);

        // 4. 검증
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getSensorNo());
        assertEquals("TempSensor-01", response.getBody().getSensorName());
    }

    @Test
    @DisplayName("단일 센서 조회 테스트")
    void getSensor_returnsSensorDetails() throws Exception {
        // 1. 테스트 데이터 준비
        Long sensorNo = 1L;
        SensorResponse mockResponse = new SensorResponse(sensorNo, "HumiditySensor-01", "heater", false, "회의실");

        // 2. WireMock으로 API 응답 정의
        stubFor(get(urlEqualTo("/api/v1/sensors/" + sensorNo))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(mockResponse))));

        // 3. FeignClient 호출
        ResponseEntity<SensorResponse> response = sensorAdaptor.getSensor(sensorNo);

        // 4. 검증
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(sensorNo, response.getBody().getSensorNo());
        assertEquals("HumiditySensor-01", response.getBody().getSensorName());
    }

    @Test
    @DisplayName("위치별 센서 목록 조회 테스트")
    void getSensorsByPlace_returnsSensorList() throws Exception {
        // 1. 테스트 데이터 준비
        String place = "회의실";
        String encodedPlace = URLEncoder.encode(place, StandardCharsets.UTF_8);
        List<SensorResponse> mockResponse = List.of(
                new SensorResponse(2L, "LightSensor-01", "heater", true, place),
                new SensorResponse(3L, "MotionSensor-01", "heater", false, place)
        );

        // 2. WireMock으로 API 응답 정의
        stubFor(get(urlEqualTo("/api/v1/sensors/place/" + encodedPlace))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(mockResponse))));

        // 3. FeignClient 호출
        ResponseEntity<List<SensorResponse>> response = sensorAdaptor.getSensors(encodedPlace);

        // 4. 검증
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals(place, response.getBody().get(0).getLocation());
    }
}