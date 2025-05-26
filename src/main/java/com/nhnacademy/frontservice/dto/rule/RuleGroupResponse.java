package com.nhnacademy.frontservice.dto.rule;

import lombok.Value;

/**
 * 규칙 그룹(RuleGroup)의 정보를 클라이언트에 전달하기 위한 응답 DTO 클래스입니다.
 * <p>
 * 이 클래스는 rule_groups 테이블의 한 행을 표현하며,
 * 규칙 그룹의 기본 정보(식별자, 이름, 설명, 활성화 여부, 우선순위)를 포함합니다.
 * 클라이언트가 규칙 그룹 목록 조회, 상세 조회 등에서 활용할 수 있습니다.
 * <p>
 * <b>연관 테이블/필드:</b>
 * <ul>
 *   <li>ruleGroupNo: rule_groups 테이블의 rule_group_no</li>
 *   <li>ruleGroupName: rule_groups 테이블의 rule_group_name</li>
 *   <li>ruleGroupDescription: rule_groups 테이블의 rule_group_description</li>
 *   <li>active: rule_groups 테이블의 active</li>
 *   <li>priority: rule_groups 테이블의 priority</li>
 * </ul>
 *
 * @author 강승우
 */
@Value
public class RuleGroupResponse {

    /**
     * 규칙 그룹의 고유 식별자입니다.
     * rule_groups 테이블의 rule_group_no 컬럼과 매핑됩니다.
     */
    Long ruleGroupNo;

    /**
     * 규칙 그룹의 이름입니다.
     * rule_groups 테이블의 rule_group_name 컬럼과 매핑됩니다.
     */
    String ruleGroupName;

    /**
     * 규칙 그룹의 상세 설명입니다.
     * rule_groups 테이블의 rule_group_description 컬럼과 매핑됩니다.
     */
    String ruleGroupDescription;

    /**
     * 규칙 그룹의 우선순위입니다.
     * 숫자가 낮을수록 높은 우선순위를 의미합니다.
     * rule_groups 테이블의 priority 컬럼과 매핑됩니다.
     */
    Integer priority;

    /**
     * 규칙 그룹의 활성화 여부입니다.
     * true 면 활성, false 면 비활성 상태를 의미합니다.
     * rule_groups 테이블의 active 컬럼과 매핑됩니다.
     */
    boolean active;

}