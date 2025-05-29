package com.nhnacademy.frontservice.adaptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhnacademy.frontservice.dto.rule.RuleRegisterRequest;
import com.nhnacademy.frontservice.dto.rule.RuleResponse;
import com.nhnacademy.frontservice.dto.rule.RuleUpdateRequest;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Objects;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

@Slf4j
@SpringBootTest(
        properties = {
                "rule-service.url=http://localhost:${wiremock.server.port}"
        }
)
@AutoConfigureWireMock(port = 0)
@ActiveProfiles("test")
class RuleAdaptorTest {
    @Autowired
    RuleAdaptor ruleAdaptor;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    @DisplayName("룰 저장")
    void testRegisterRule() throws Exception {
        RuleRegisterRequest request = new RuleRegisterRequest(
                1L,
                "환기",
                "환기를 하기 위해서 사용합니다.",
                1
        );

        RuleResponse response = new RuleResponse(
                100L,
                "환기",
                "환기를 하기 위해서 사용합니다.",
                1,
                true,
                1L,
                List.of(), List.of(), List.of(), List.of(), List.of()
        );

        stubFor(post(urlPathEqualTo("/api/v1/rules"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(response))));

        ResponseEntity<RuleResponse> result = ruleAdaptor.registerRule(request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
    }

    @Test
    @DisplayName("룰 조회")
    void testGetRule() throws Exception {
        long ruleNo = 1L;
        RuleResponse response = new RuleResponse(
                ruleNo,
                "냉방",
                "냉방을 하기 위해서 사용합니다.",
                1,
                true,
                1L,
                List.of(), List.of(), List.of(), List.of(), List.of()
        );

        stubFor(get(urlPathEqualTo("/api/v1/rules/" + ruleNo))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(response))));

        ResponseEntity<RuleResponse> result = ruleAdaptor.getRule(ruleNo);

        assertEquals(HttpStatus.OK, result.getStatusCode());
    }

    @Test
    @DisplayName("모든 룰 조회")
    void testGetRules() throws Exception {
        List<RuleResponse> responseList = List.of(
                new RuleResponse(3L,
                        "냉방3",
                        "냉방3을 하기 위해서 사용합니다.",
                        3,
                        true,
                        1L,
                        List.of(), List.of(), List.of(), List.of(), List.of()),
                new RuleResponse(4L,
                        "냉방4",
                        "냉방4을 하기 위해서 사용합니다.",
                        4,
                        true,
                        1L,
                        List.of(), List.of(), List.of(), List.of(), List.of())
        );

        stubFor(get(urlPathEqualTo("/api/v1/rules"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(responseList))));

        ResponseEntity<List<RuleResponse>> result = ruleAdaptor.getRules();

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(2, Objects.requireNonNull(result.getBody()).size());
    }

    @Test
    @DisplayName("룰 업데이트")
    void testUpdateRule() throws Exception {
        long ruleNo = 5L;
        RuleUpdateRequest request = new RuleUpdateRequest(
                "번개",
                "번개를 날립니다.",
                1
        );
        RuleResponse response = new RuleResponse(
                ruleNo,
                "번개",
                "번개를 날립니다.",
                1,
                true,
                1L,
                List.of(), List.of(), List.of(), List.of(), List.of()
        );

        stubFor(put(urlPathEqualTo("/api/v1/rules/" + ruleNo))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(response))));

        ResponseEntity<RuleResponse> result = ruleAdaptor.updateRule(ruleNo, request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
    }

    @Test
    @DisplayName("룰 삭제")
    void testDeleteRule() {
        long ruleNo = 1L;

        stubFor(delete(urlPathEqualTo("/api/v1/rules/" + ruleNo))
                .willReturn(aResponse()
                        .withStatus(204)));

        ResponseEntity<Void> result = ruleAdaptor.deleteRule(ruleNo);

        assertEquals(HttpStatus.NO_CONTENT, result.getStatusCode());
    }
}