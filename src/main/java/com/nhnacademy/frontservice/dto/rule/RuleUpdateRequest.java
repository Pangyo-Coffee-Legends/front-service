package com.nhnacademy.frontservice.dto.rule;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 규칙(Rule) 수정 요청을 위한 DTO 클래스입니다.
 * <p>
 * 클라이언트가 기존 규칙의 정보를 수정할 때 사용되며,
 * 규칙의 이름, 설명, 우선순위 값을 변경할 수 있습니다.
 * <p>
 * <b>연관 테이블/필드:</b>
 * <ul>
 *   <li>ruleName: rules 테이블의 rule_name</li>
 *   <li>ruleDescription: rules 테이블의 rule_description</li>
 *   <li>rulePriority: rules 테이블의 rule_priority</li>
 * </ul>
 *
 * @author 강승우
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RuleUpdateRequest {

    /**
     * 수정할 규칙의 이름입니다.
     * rules 테이블의 rule_name 컬럼과 매핑됩니다.
     */
    @NotBlank(message = "룰 이름은 필수 항목입니다.")
    String ruleName;

    /**
     * 수정할 규칙의 상세 설명입니다.
     * rules 테이블의 rule_description 컬럼과 매핑됩니다.
     */
    @Size(max = 200, message = "최대 길이가 200입니다.")
    String ruleDescription;

    /**
     * 수정할 규칙의 우선순위입니다.
     * 숫자가 낮을수록 높은 우선순위를 가집니다.
     * rules 테이블의 rule_priority 컬럼과 매핑됩니다.
     */
    @Min(value = 0, message = "priority 는 0 이상입니다.")
    Integer rulePriority;
}