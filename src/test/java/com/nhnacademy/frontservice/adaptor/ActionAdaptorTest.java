package com.nhnacademy.frontservice.adaptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.nhnacademy.frontservice.dto.action.ActionRegisterRequest;
import com.nhnacademy.frontservice.dto.action.ActionResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@ActiveProfiles("test")
@SpringBootTest(
        properties = {
                "rule-service.url=http://localhost:${wiremock.server.port}"
        }
)
@AutoConfigureWireMock(port = 0)
class ActionAdaptorTest {
    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    ActionAdaptor actionAdaptor;

    @BeforeEach
    void setup() {
        WireMock.reset();
    }

    @Test
    @DisplayName("액션 저장 확인")
    void registerActionTest() throws Exception {
        ActionRegisterRequest request = new ActionRegisterRequest(
                1L, "EMAIL", "{\"to\":\"user@test.com\"}", 1
        );

        ActionResponse expectedResponse = new ActionResponse(
                100L, 1L, "EMAIL", "{\"to\":\"user@test.com\"}", 1
        );

        // WireMock 스텁 설정: POST /api/v1/actions
        stubFor(post(urlEqualTo("/api/v1/actions"))
                .willReturn(aResponse()
                        .withStatus(HttpStatus.OK.value())
                        .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                        .withBody(objectMapper.writeValueAsString(expectedResponse)))
        );

        // Feign Client 호출
        var response = actionAdaptor.registerAction(request);

        assertEquals(HttpStatus.OK.value(), response.getStatusCode().value());
        assertEquals(expectedResponse, response.getBody());
    }

    @Test
    @DisplayName("액션 조회 성공")
    void getActionTest() throws Exception {
        Long actNo = 200L;
        ActionResponse expectedResponse = new ActionResponse(
                actNo, 1L, "SMS", "{\"phone\":\"010-1234-5678\"}", 2
        );

        stubFor(get(urlEqualTo("/api/v1/actions/" + actNo))
                .willReturn(aResponse()
                        .withStatus(HttpStatus.OK.value())
                        .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                        .withBody(objectMapper.writeValueAsString(expectedResponse)))
        );

        var response = actionAdaptor.getAction(actNo);

        assertEquals(HttpStatus.OK.value(), response.getStatusCode().value());
        assertEquals(expectedResponse, response.getBody());
    }

    @Test
    @DisplayName("액션 전체 조회")
    void getActions_ReturnsActionList() throws Exception {
        // 1. 테스트 데이터 준비
        List<ActionResponse> mockResponses = List.of(
                new ActionResponse(1L, 10L, "ALERT", "Message1", 1),
                new ActionResponse(2L, 11L, "NOTIFY", "Message2", 2)
        );

        // 2. WireMock 스텁 설정
        stubFor(get(urlEqualTo("/api/v1/actions"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(mockResponses))));

        // 3. FeignClient 호출
        ResponseEntity<List<ActionResponse>> response = actionAdaptor.getActions();

        // 4. 검증
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("ALERT", response.getBody().get(0).getActType());
    }

    @Test
    @DisplayName("조건별 액션 전체 조회")
    void getActionByRule_ValidRuleNo_ReturnsActionList() throws Exception {
        // 1. 테스트 데이터 준비
        Long ruleNo = 10L;
        List<ActionResponse> mockResponses = List.of(
                new ActionResponse(3L, ruleNo, "ALERT", "Rule10 Message1", 1),
                new ActionResponse(4L, ruleNo, "ALERT", "Rule10 Message2", 2),
                new ActionResponse(5L, ruleNo, "ALERT", "Rule10 Message3", 3)
        );

        // 2. WireMock 스텁 설정
        stubFor(get(urlEqualTo("/api/v1/actions/rule/" + ruleNo))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(mockResponses))));

        // 3. FeignClient 호출
        ResponseEntity<List<ActionResponse>> response = actionAdaptor.getActionByRule(ruleNo);

        // 4. 검증
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(3, response.getBody().size());
        assertEquals("Rule10 Message1", response.getBody().get(0).getActParam());
    }

    @Test
    @DisplayName("액션 삭제 성공")
    void deleteActionTest() {
        Long actNo = 300L;

        stubFor(delete(urlEqualTo("/api/v1/actions/" + actNo))
                .willReturn(aResponse().withStatus(HttpStatus.NO_CONTENT.value()))
        );

        var response = actionAdaptor.deleteAction(actNo);

        assertEquals(HttpStatus.NO_CONTENT.value(), response.getStatusCode().value());
    }
}