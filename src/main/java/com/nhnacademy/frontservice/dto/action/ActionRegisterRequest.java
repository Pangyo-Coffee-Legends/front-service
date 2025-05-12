package com.nhnacademy.frontservice.dto.action;

import lombok.Value;

/**
 * 액션(Action) 등록 요청을 위한 DTO 클래스입니다.
 * <p>
 * 클라이언트가 새로운 액션을 생성할 때 필요한 정보를 전달하는 데 사용됩니다.
 * 각 액션은 특정 규칙(Rule)에 속하며, 액션 유형, 파라미터, 우선순위 정보를 포함합니다.
 * </p>
 * <p>
 * <b>연관 테이블/필드:</b>
 * <ul>
 *   <li>ruleNo: actions 테이블의 rule_no (rules 테이블 외래키)</li>
 *   <li>actType: actions 테이블의 act_type</li>
 *   <li>actParam: actions 테이블의 act_params</li>
 *   <li>actPriority: actions 테이블의 act_priority</li>
 * </ul>
 * </p>
 *
 * @author 강승우
 */
@Value
public class ActionRegisterRequest {

    /**
     * 액션이 속할 규칙의 식별자입니다.
     * actions 테이블의 rule_no 컬럼과 매핑되며, rules 테이블을 참조합니다.
     */
    Long ruleNo;

    /**
     * 액션의 유형입니다.
     * 예: "EMAIL", "PUSH", "LOG" 등
     * actions 테이블의 act_type 컬럼과 매핑됩니다.
     */
    String actType;

    /**
     * 액션 실행에 필요한 파라미터입니다.
     * JSON 문자열 등으로 다양한 실행 정보를 전달합니다.
     * actions 테이블의 act_params 컬럼과 매핑됩니다.
     */
    String actParam;

    /**
     * 액션의 우선순위입니다.
     * 여러 액션이 있을 때 실행 순서를 결정합니다.
     * actions 테이블의 act_priority 컬럼과 매핑됩니다.
     */
    Integer actPriority;
}
