package com.nhnacademy.frontservice.dto.rule;

import lombok.Value;

/**
 * 액션(Action)의 정보를 클라이언트에 전달하기 위한 응답 DTO 클래스입니다.
 * <p>
 * 이 클래스는 actions 테이블의 한 행을 표현하며,
 * 액션의 기본 정보(식별자, 소속 규칙, 액션 유형, 파라미터, 우선순위)를 포함합니다.
 * </p>
 * <p>
 * <b>연관 테이블/필드:</b>
 * <ul>
 *   <li>actNo: actions 테이블의 act_no</li>
 *   <li>ruleNo: actions 테이블의 rule_no (rules 테이블 참조)</li>
 *   <li>actType: actions 테이블의 act_type (예: EMAIL, PUSH 등)</li>
 *   <li>actParam: actions 테이블의 act_params (액션 실행에 필요한 파라미터, JSON 등)</li>
 *   <li>actPriority: actions 테이블의 act_priority (실행 우선순위)</li>
 * </ul>
 * </p>
 *
 * @author 강승우
 */
@Value
public class ActionResponse {

    /**
     * 액션의 고유 식별자입니다.
     * actions 테이블의 act_no 컬럼과 매핑됩니다.
     */
    Long actNo;

    /**
     * 액션이 속한 규칙의 식별자입니다.
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
