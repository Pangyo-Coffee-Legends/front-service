package com.nhnacademy.frontservice.adaptor;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhnacademy.frontservice.dto.rule.RuleGroupRegisterRequest;
import com.nhnacademy.frontservice.dto.rule.RuleGroupResponse;
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

@SpringBootTest(
        properties = {
                "rule-service.url=http://localhost:${wiremock.server.port}"
        }
)
@AutoConfigureWireMock(port = 0)
@ActiveProfiles("test")
class RuleGroupAdaptorTest {
    @Autowired
    RuleGroupAdaptor ruleGroupAdaptor;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    @DisplayName("룰 그룹 생성")
    void testRegisterRuleGroup() throws Exception {
        RuleGroupRegisterRequest request = new RuleGroupRegisterRequest(
                "테스트 룰 그룹",
                "테스트 룰 그룹의 내용입니다.",
                1
        );
        RuleGroupResponse response = new RuleGroupResponse(
                1L,
                "테스트 룰 그룹",
                "테스트 룰 그룹의 내용입니다.",
                1,
                true
        );

        stubFor(post(urlPathEqualTo("/api/v1/rule-groups"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(response))));

        ResponseEntity<RuleGroupResponse> result = ruleGroupAdaptor.registerRuleGroup(request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
    }

    @Test
    @DisplayName("룰 그룹 조회")
    void testGetRuleGroup() throws Exception {
        long ruleGroupNo = 2L;
        RuleGroupResponse response = new RuleGroupResponse(
                ruleGroupNo,
                "테스트 룰 그룹",
                "테스트 룰 그룹의 내용입니다.",
                2,
                true
        );

        stubFor(get(urlPathEqualTo("/api/v1/rule-groups/" + ruleGroupNo))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(response))));

        ResponseEntity<RuleGroupResponse> result = ruleGroupAdaptor.getRuleGroup(ruleGroupNo);

        assertEquals(HttpStatus.OK, result.getStatusCode());
    }

    @Test
    @DisplayName("룰 그룹 전체 조회")
    void testGetRuleGroups() throws Exception {
        List<RuleGroupResponse> responseList = List.of(
                new RuleGroupResponse(
                        3L,
                        "테스트 룰 그룹3",
                        "테스트 룰 그룹3의 내용입니다.",
                        3,
                        true
                ),
                new RuleGroupResponse(
                        4L,
                        "테스트 룰4 그룹",
                        "테스트 룰4 그룹의 내용입니다.",
                        4,
                        true
                ));

        stubFor(get(urlPathEqualTo("/api/v1/rule-groups"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(objectMapper.writeValueAsString(responseList))));

        ResponseEntity<List<RuleGroupResponse>> result = ruleGroupAdaptor.getRuleGroups();

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(2, Objects.requireNonNull(result.getBody()).size());
    }

    @Test
    @DisplayName("룰 그룹 삭제")
    void testDeleteRuleGroup() {
        long ruleGroupNo = 1L;

        stubFor(delete(urlPathEqualTo("/api/v1/rule-groups/" + ruleGroupNo))
                .willReturn(aResponse()
                        .withStatus(204)));

        ResponseEntity<Void> result = ruleGroupAdaptor.deleteRuleGroup(ruleGroupNo);

        assertEquals(HttpStatus.NO_CONTENT, result.getStatusCode());
    }
}