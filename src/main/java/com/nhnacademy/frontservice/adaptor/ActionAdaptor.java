package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.action.ActionRegisterRequest;
import com.nhnacademy.frontservice.dto.action.ActionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Action Service와 통신하기 위한 Feign Client 인터페이스입니다.
 * <p>
 * 액션 등록, 조회, 삭제 등 액션 관련 기능을 제공합니다.
 * </p>
 */
@FeignClient(
        name = "action-service",
        url = "http://localhost:10263",
        path = "/api/v1/actions"
)
public interface ActionAdaptor {

    /**
     * 새로운 액션을 등록합니다.
     *
     * @param request 액션 등록 요청 객체
     * @return 등록된 액션 정보를 담은 {@link ActionResponse}
     */
    @PostMapping
    ResponseEntity<ActionResponse> registerAction(@RequestBody ActionRegisterRequest request);

    /**
     * 지정한 액션 번호(actNo)에 해당하는 액션을 조회합니다.
     *
     * @param actNo 액션 번호
     * @return 조회된 액션 정보를 담은 {@link ActionResponse}
     */
    @GetMapping("/{actNo}")
    ResponseEntity<ActionResponse> getAction(@PathVariable("actNo") Long actNo);

    /**
     * 전체 액션 목록을 조회합니다.
     *
     * @return 액션 목록 {@link ActionResponse} 리스트
     */
    @GetMapping
    ResponseEntity<List<ActionResponse>> getActions();

    /**
     * 지정한 룰 번호(ruleNo)에 연관된 모든 액션을 조회합니다.
     *
     * @param ruleNo 룰 번호
     * @return 해당 룰에 연관된 액션 목록 {@link ActionResponse} 리스트
     */
    @GetMapping("/rule/{ruleNo}")
    ResponseEntity<List<ActionResponse>> getActionByRule(@PathVariable("ruleNo") Long ruleNo);

    /**
     * 지정한 액션 번호(actNo)에 해당하는 액션을 삭제합니다.
     *
     * @param actNo 액션 번호
     * @return 삭제 결과를 나타내는 응답
     */
    @DeleteMapping("/{actNo}")
    ResponseEntity<Void> deleteAction(@PathVariable("actNo") Long actNo);

    /**
     * 지정한 룰 번호(ruleNo)에 연관된 모든 액션을 삭제합니다.
     *
     * @param ruleNo 룰 번호
     * @return 삭제 결과를 나타내는 응답
     */
    @DeleteMapping("/rule/{ruleNo}")
    ResponseEntity<Void> deleteActionByRule(@PathVariable("ruleNo") Long ruleNo);

    /**
     * 지정한 룰 번호(ruleNo)와 액션 번호(actionNo)에 해당하는 액션을 삭제합니다.
     *
     * @param ruleNo   룰 번호
     * @param actionNo 액션 번호
     * @return 삭제 결과를 나타내는 응답
     */
    @DeleteMapping("/rule/{ruleNo}/action/{actionNo}")
    ResponseEntity<Void> deleteActionsByRuleNoAndActionNo(
            @PathVariable("ruleNo") Long ruleNo,
            @PathVariable("actionNo") Long actionNo
    );
}