package com.nhnacademy.frontservice.dto.condition;

import lombok.Value;

/**
 * 규칙(Rule)에 속한 조건(Condition)의 정보를 클라이언트에 전달하기 위한 응답 DTO 클래스입니다.
 * <p>
 * 이 클래스는 conditions 테이블의 한 행을 표현하며,
 * 조건의 기본 정보(식별자, 소속 규칙, 비교 타입, 필드명, 비교값, 우선순위)를 포함합니다.
 * </p>
 * <p>
 * <b>연관 테이블/필드:</b>
 * <ul>
 *   <li>conditionNo: conditions 테이블의 cond_no</li>
 *   <li>ruleNo: conditions 테이블의 rule_no (rules 테이블 참조)</li>
 *   <li>conType: conditions 테이블의 con_type</li>
 *   <li>conField: conditions 테이블의 con_field</li>
 *   <li>conValue: conditions 테이블의 con_value</li>
 *   <li>conPriority: conditions 테이블의 con_priority</li>
 * </ul>
 * </p>
 *
 * @author 강승우
 */
@Value
public class ConditionResponse {

    /**
     * 조건의 고유 식별자입니다.
     * conditions 테이블의 con_no 컬럼과 매핑됩니다.
     */
    Long conNo;

    /**
     * 조건이 속한 규칙의 식별자입니다.
     * conditions 테이블의 rule_no 컬럼과 매핑되며, rules 테이블을 참조합니다.
     */
    Long ruleNo;

    /**
     * 조건의 비교 연산자 유형입니다.
     * 예: "EQUALS", "GREATER_THAN", "LESS_THAN", "CONTAINS" 등
     * conditions 테이블의 con_type 컬럼과 매핑됩니다.
     */
    String conType;

    /**
     * 조건이 적용될 필드명입니다.
     * 평가 시 이 필드명을 기준으로 데이터를 조회합니다.
     * conditions 테이블의 con_field 컬럼과 매핑됩니다.
     */
    String conField;

    /**
     * 조건 비교에 사용되는 값입니다.
     * 평가 시 conField의 값과 이 값을 conType에 따라 비교합니다.
     * conditions 테이블의 con_value 컬럼과 매핑됩니다.
     */
    String conValue;

    /**
     * 조건의 우선순위입니다.
     * 같은 규칙 내에서 여러 조건이 있을 때 평가 순서를 결정합니다.
     * 숫자가 낮을수록 높은 우선순위를 가집니다.
     * conditions 테이블의 con_priority 컬럼과 매핑됩니다.
     */
    Integer conPriority;
}