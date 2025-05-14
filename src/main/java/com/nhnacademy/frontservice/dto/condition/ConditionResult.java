package com.nhnacademy.frontservice.dto.condition;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 조건(Condition) 평가 결과를 표현하는 클래스입니다.
 * <p>
 * 규칙 엔진에서 단일 조건을 평가한 후, 그 결과를 저장하는 데 사용됩니다.
 * 조건의 식별자, 필드명, 비교 타입, 비교 값, 그리고 조건 충족 여부를 포함합니다.
 * </p>
 * <p>
 * <b>주요 필드:</b>
 * <ul>
 *   <li>conNo: conditions 테이블의 con_no (조건 식별자)</li>
 *   <li>conField: 조건이 적용된 필드명</li>
 *   <li>conType: 조건 비교 타입 (예: "EQ", "GT", "LT", "LIKE" 등)</li>
 *   <li>conValue: 조건 비교 값</li>
 *   <li>matched: 조건 충족 여부 (true: 충족, false: 불충족)</li>
 * </ul>
 * </p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConditionResult {
    /**
     * 조건의 고유 식별자입니다.
     * conditions 테이블의 con_no 컬럼과 매핑됩니다.
     */
    Long conNo;

    /**
     * 조건이 적용된 필드의 이름입니다.
     * 실제 평가 시 이 필드명으로 데이터를 찾아 비교합니다.
     */
    String conField;

    /**
     * 조건의 비교 연산자 타입입니다.
     * 예: "EQ"(equals), "GT"(greater than), "LT"(less than), "LIKE" 등
     */
    String conType;

    /**
     * 조건 비교에 사용된 값입니다.
     * conField의 값과 이 값을 conType에 따라 비교한 결과가 matched 에 저장됩니다.
     */
    String conValue;

    /**
     * 조건 평가 결과입니다.
     * true 인 경우 조건이 충족됨을, false 인 경우 충족되지 않음을 의미합니다.
     */
    boolean matched;
}
