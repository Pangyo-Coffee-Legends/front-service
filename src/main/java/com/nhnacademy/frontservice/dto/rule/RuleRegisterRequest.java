package com.nhnacademy.frontservice.dto.comfort;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Value;

/**
 * 규칙(Rule) 등록 요청을 위한 DTO 클래스입니다.
 * <p>
 * 클라이언트가 새로운 규칙을 생성할 때 필요한 정보를 전달하는 데 사용됩니다.
 * 필수 입력값으로는 규칙 그룹 식별자(ruleGroupNo), 규칙 이름(ruleName),
 * 우선순위(rulePriority)가 있으며,
 * 규칙 설명(ruleDescription)은 선택적으로 입력할 수 있습니다.
 * <p>
 * <b>연관 테이블/필드:</b>
 * <ul>
 *   <li>ruleGroupNo: rule_groups 테이블의 rule_group_no</li>
 *   <li>ruleName: rules 테이블의 rule_name</li>
 *   <li>ruleDescription: rules 테이블의 rule_description</li>
 *   <li>rulePriority: rules 테이블의 rule_priority</li>
 * </ul>
 *
 * @author 강승우
 */
@Value
public class RuleRegisterRequest {

    /**
     * 규칙이 소속될 규칙 그룹의 식별자입니다.
     * rule_groups 테이블의 rule_group_no 컬럼과 매핑됩니다.
     */
    @NotNull(message = "규칙 그룹 식별자는 필수 항목입니다.")
    Long ruleGroupNo;

    /**
     * 등록할 규칙의 이름입니다.
     * rules 테이블의 rule_name 컬럼과 매핑됩니다.
     */
    @NotBlank(message = "규칙 이름은 필수 항목입니다.")
    String ruleName;

    /**
     * 등록할 규칙의 상세 설명입니다.
     * 선택 항목이며, rules 테이블의 rule_description 컬럼과 매핑됩니다.
     */
    @Size(max = 200, message = "최대 길이가 200 입니다.")
    String ruleDescription;

    /**
     * 등록할 규칙의 우선순위입니다.
     * rules 테이블의 rule_priority 컬럼과 매핑됩니다.
     * 숫자가 낮을수록 높은 우선순위를 가집니다.
     */
    @NotNull(message = "우선순위는 필수 항목입니다.")
    Integer rulePriority;
}
