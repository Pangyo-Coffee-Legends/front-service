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
        "iot-service.url=http://localhost:${wiremock.server.port}"
})
class SensorAdaptorTest {

    @Autowired
    private SensorAdaptor sensorAdaptor;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("센서 등록 테스트")
    void registerSensor_returnsCreatedResponse() throws Exception {
        SensorRegisterRequest request = new SensorRegisterRequest("TempSensor-01", "heater", true, "회의실");
        SensorResponse mockResponse = new SensorResponse("TempSensor-01", "heater", true, "회의실");

        stubFor(post(urlEqualTo("/api/v1/sensors"))
                .withRequestBody(equalToJson(objectMapper.writeValueAsString(request)))
                .willReturn(aResponse()
                        .withStatus(201)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(mockResponse))));

        ResponseEntity<SensorResponse> response = sensorAdaptor.registerSensor(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("TempSensor-01", response.getBody().getSensorName());
        assertEquals("heater", response.getBody().getSensorType());
        assertEquals("회의실", response.getBody().getLocation());
        assertEquals(true, response.getBody().getSensorStatus());
    }

    @Test
    @DisplayName("단일 센서 조회 테스트")
    void getSensor_returnsSensorDetails() throws Exception {
        Long sensorNo = 1L;  // 실제 사용은 안 됨
        SensorResponse mockResponse = new SensorResponse("HumiditySensor-01", "heater", false, "회의실");

        stubFor(get(urlEqualTo("/api/v1/sensors/" + sensorNo))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(mockResponse))));

        ResponseEntity<SensorResponse> response = sensorAdaptor.getSensor(sensorNo);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("HumiditySensor-01", response.getBody().getSensorName());
        assertEquals("heater", response.getBody().getSensorType());
        assertEquals("회의실", response.getBody().getLocation());
        assertEquals(false, response.getBody().getSensorStatus());
    }

    @Test
    @DisplayName("위치별 센서 목록 조회 테스트")
    void getSensorsByPlace_returnsSensorList() throws Exception {
        String place = "회의실";
        String encodedPlace = URLEncoder.encode(place, StandardCharsets.UTF_8);
        List<SensorResponse> mockResponse = List.of(
                new SensorResponse("LightSensor-01", "heater", true, place),
                new SensorResponse("MotionSensor-01", "heater", false, place)
        );

        stubFor(get(urlEqualTo("/api/v1/sensors/place/" + encodedPlace))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(mockResponse))));

        ResponseEntity<List<SensorResponse>> response = sensorAdaptor.getSensors(encodedPlace);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals(place, response.getBody().get(0).getLocation());
    }
}
