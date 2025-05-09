package com.nhnacademy.frontservice.dto.comfort;

import com.nhnacademy.frontservice.dto.comfort.ConditionResult;
import com.nhnacademy.frontservice.dto.comfort.ActionResult;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 규칙 평가 및 실행 결과를 담는 DTO 클래스입니다.
 * <p>
 * 규칙 엔진에서 하나의 룰을 평가하고 액션을 실행한 후, 그 전체 결과를 담아 반환합니다.
 * 조건 평가 결과, 실행된 액션, 성공/실패 여부 등 룰 평가와 관련된 모든 정보를 포함합니다.
 * </p>
 */
public class RuleEvaluationResult {

    /**
     * 평가된 규칙의 식별자
     */
    private Long ruleNo;

    /**
     * 평가된 규칙의 이름
     */
    private String ruleName;

    /**
     * 규칙 평가 성공 여부 (모든 조건이 충족되었는지)
     */
    private boolean success;

    /**
     * 각 조건별 평가 결과 목록
     */
    private List<ConditionResult> conditionResults = new ArrayList<>();

    /**
     * 실행된 액션 결과 목록
     */
    private List<ActionResult> executedActions = new ArrayList<>();

    /**
     * 규칙 평가 결과 메시지
     */
    private String message;

    /**
     * 규칙 평가 시각
     */
    private LocalDateTime evaluatedAt;

    /**
     * 기본 생성자
     */
    protected RuleEvaluationResult() {}

    public RuleEvaluationResult(Long ruleNo, String ruleName, boolean success) {
        this.ruleNo = ruleNo;
        this.ruleName = ruleName;
        this.success = success;
    }

    public Long getRuleNo() {
        return ruleNo;
    }

    public void setRuleNo(Long ruleNo) {
        this.ruleNo = ruleNo;
    }

    public String getRuleName() {
        return ruleName;
    }

    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public List<ConditionResult> getConditionResults() {
        return conditionResults;
    }

    public void setConditionResults(List<ConditionResult> conditionResults) {
        this.conditionResults = conditionResults;
    }

    public List<ActionResult> getExecutedActions() {
        return executedActions;
    }

    public void setExecutedActions(List<ActionResult> executedActions) {
        this.executedActions = executedActions;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getEvaluatedAt() {
        return evaluatedAt;
    }

    public void setEvaluatedAt(LocalDateTime evaluatedAt) {
        this.evaluatedAt = evaluatedAt;
    }
}

