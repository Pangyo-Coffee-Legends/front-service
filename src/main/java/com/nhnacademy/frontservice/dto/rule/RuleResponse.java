package com.nhnacademy.frontservice.dto.comfort;

import lombok.Value;

import java.util.List;

/**
 * 규칙(Rule)의 정보를 포함하는 응답 클래스입니다.
 * 이 클래스는 규칙의 기본 속성과 함께 관련된 액션, 조건, 파라미터, 스케줄, 트리거 이벤트의 ID 목록을 포함합니다.
 * 클라이언트에 Rule 엔티티의 데이터를 전송하는 DTO(Data Transfer Object) 역할을 합니다.
 */
@Value
public class RuleResponse {

    /**
     * 규칙의 고유 식별자입니다.
     * 데이터베이스에서 rules 테이블의 rule_no 컬럼 값과 매핑됩니다.
     */
    Long ruleNo;

    /**
     * 규칙의 이름입니다.
     * 규칙을 식별하는 용도로 사용되며, null 이 될 수 없습니다.
     */
    String ruleName;

    /**
     * 규칙에 대한 상세 설명입니다.
     * 규칙의 목적과 동작 방식에 대한 설명을 포함합니다.
     */
    String ruleDescription;

    /**
     * 규칙의 우선순위입니다.
     * 여러 규칙이 동시에 적용될 수 있을 때 우선순위에 따라 적용 순서가 결정됩니다.
     * 숫자가 낮을수록 높은 우선순위를 가집니다.
     */
    Integer rulePriority;

    /**
     * 규칙의 활성화 상태를 나타냅니다.
     * true 인 경우 규칙이 활성화되어 평가 및 실행 대상이 됩니다.
     * false 인 경우 규칙이 비활성화되어 평가 및 실행 대상에서 제외됩니다.
     */
    boolean active;

    /**
     * 규칙이 소속된 규칙 그룹의 식별자입니다.
     * 데이터베이스에서 rule_groups 테이블의 rule_group_no 컬럼 값과 매핑됩니다.
     */
    Long ruleGroupNo;

    /**
     * 이 규칙에 연결된 액션 목록의 식별자입니다.
     * 데이터베이스에서 actions 테이블의 act_no 컬럼 값 목록과 매핑됩니다.
     */
    List<Long> actionListNo;

    /**
     * 이 규칙에 연결된 조건 목록의 식별자입니다.
     * 데이터베이스에서 conditions 테이블의 con_no 컬럼 값 목록과 매핑됩니다.
     */
    List<Long> conditionListNo;

    /**
     * 이 규칙에 연결된 파라미터 목록의 식별자입니다.
     * 데이터베이스에서 rule_parameters 테이블의 param_no 컬럼 값 목록과 매핑됩니다.
     */
    List<Long> ruleParameterListNo;

    /**
     * 이 규칙에 연결된 스케줄 목록의 식별자입니다.
     * 데이터베이스에서 rule_schedules 테이블의 schedule_no 컬럼 값 목록과 매핑됩니다.
     */
    List<Long> ruleScheduleListNo;

    /**
     * 이 규칙에 연결된 트리거 이벤트 목록의 식별자입니다.
     * 데이터베이스에서 trigger_events 테이블의 trigger_no 컬럼 값 목록과 매핑됩니다.
     */
    List<Long> triggerEventListNo;
}
