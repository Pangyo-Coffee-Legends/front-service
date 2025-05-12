package com.nhnacademy.frontservice.dto.condition;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 조건(Condition) 등록 요청을 위한 DTO 클래스입니다.
 * <p>
 * 클라이언트가 새로운 조건을 생성할 때 필요한 정보를 전달하는 데 사용됩니다.
 * 각 조건은 특정 규칙(Rule)에 속하며, 비교 타입, 필드명, 비교값, 우선순위 정보를 포함합니다.
 * </p>
 * <p>
 * <b>연관 테이블/필드:</b>
 * <ul>
 *   <li>ruleNo: conditions 테이블의 rule_no (rules 테이블 외래키)</li>
 *   <li>conType: conditions 테이블의 con_type</li>
 *   <li>conField: conditions 테이블의 con_field</li>
 *   <li>conValue: conditions 테이블의 con_value</li>
 *   <li>conPriority: conditions 테이블의 con_priority</li>
 * </ul>
 * </p>
 *
 * @author 강승우
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConditionRegisterRequest {

    /**
     * 조건이 속할 규칙의 식별자입니다.
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
     * 조건 비교에 사용될 값입니다.
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