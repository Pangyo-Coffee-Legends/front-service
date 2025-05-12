package com.nhnacademy.frontservice.adaptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.nhnacademy.frontservice.dto.condition.ConditionRegisterRequest;
import com.nhnacademy.frontservice.dto.condition.ConditionResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ActiveProfiles("test")
@SpringBootTest(
        properties = {
                "rule-service.url=http://localhost:${wiremock.server.port}"
        }
)
@AutoConfigureWireMock(port = 0)
class ConditionAdaptorTest {
    @Autowired
    ConditionAdaptor conditionAdaptor;

    @Autowired
    ObjectMapper objectMapper;

    @BeforeEach
    void setup() {
        WireMock.reset();
    }

    @Test
    @DisplayName("컨디션 저장 확인")
    void registerConditionTest() throws Exception {
        ConditionRegisterRequest request = new ConditionRegisterRequest(
                1L,
                "EQ",
                "TEST Condition",
                "200",
                1
        );

        ConditionResponse expectedResponse = new ConditionResponse(
                100L,
                1L,
                "EQ",
                "TEST Condition",
                "200",
                1
        );

        stubFor(post(urlEqualTo("/api/v1/conditions"))
                .willReturn(aResponse()
                        .withStatus(HttpStatus.OK.value())
                        .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                        .withBody(objectMapper.writeValueAsString(expectedResponse)))
        );

        var response = conditionAdaptor.registerCondition(request);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(expectedResponse, response.getBody());
    }

    @Test
    @DisplayName("컨디션 조회 성공")
    void getConditionTest() throws Exception {
        Long conditionNo = 2L;
        ConditionResponse expectedResponse = new ConditionResponse(
                conditionNo,
                10L,
                "LT",
                "Test Condition",
                "100",
                1
        );

        stubFor(get(urlPathEqualTo("/api/v1/conditions/" + conditionNo))
                .willReturn(aResponse()
                        .withStatus(HttpStatus.OK.value())
                        .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                        .withBody(objectMapper.writeValueAsString(expectedResponse)))
        );

        var response = conditionAdaptor.getCondition(conditionNo);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(expectedResponse, response.getBody());
    }

    @Test
    @DisplayName("삭제 테스트 성공")
    void deleteConditionTest() {
        Long conditionNo = 3L;
        stubFor(delete(urlPathEqualTo("/api/v1/conditions/" + conditionNo))
                .willReturn(aResponse().withStatus(HttpStatus.NO_CONTENT.value()))
        );

        var response = conditionAdaptor.deleteCondition(conditionNo);

        assertEquals(204, response.getStatusCode().value());
    }
}