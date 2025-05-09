package com.nhnacademy.frontservice.dto.comfort;

import lombok.Value;

/**
 * 룰 파라미터(Parameter)의 정보를 클라이언트에 전달하기 위한 응답 DTO 클래스입니다.
 * <p>
 * 이 클래스는 rule_parameters 테이블의 한 행을 표현하며,
 * 파라미터의 기본 정보(식별자, 소속 규칙, 파라미터 이름, 파라미터 값)를 포함합니다.
 * </p>
 * <p>
 * <b>연관 테이블/필드:</b>
 * <ul>
 *   <li>paramNo: rule_parameters 테이블의 param_no</li>
 *   <li>ruleNo: rule_parameters 테이블의 rule_no (rules 테이블 참조)</li>
 *   <li>paramName: rule_parameters 테이블의 param_name</li>
 *   <li>paramValue: rule_parameters 테이블의 param_value</li>
 * </ul>
 * </p>
 *
 * @author 강승우
 */
@Value
public class ParameterResponse {

    /**
     * 파라미터의 고유 식별자입니다.
     * rule_parameters 테이블의 param_no 컬럼과 매핑됩니다.
     */
    Long paramNo;

    /**
     * 파라미터가 속한 규칙의 식별자입니다.
     * rule_parameters 테이블의 rule_no 컬럼과 매핑되며, rules 테이블을 참조합니다.
     */
    Long ruleNo;

    /**
     * 파라미터의 이름입니다.
     * rule_parameters 테이블의 param_name 컬럼과 매핑됩니다.
     */
    String paramName;

    /**
     * 파라미터의 값입니다.
     * rule_parameters 테이블의 param_value 컬럼과 매핑됩니다.
     */
    String paramValue;
}
