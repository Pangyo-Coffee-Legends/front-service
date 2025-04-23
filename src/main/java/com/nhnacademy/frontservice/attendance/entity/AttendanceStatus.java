package com.nhnacademy.frontservice.attendance.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 출결 상태 정보를 담는 엔티티입니다.
 */
@Entity
@Table(name = "attendance_status")
@NoArgsConstructor
public class AttendanceStatus {

    /**
     * 상태 코드 (예: 1 = 출석)
     */
    @Id
    @Column(name = "code")
    private Long code;

    /**
     * 상태 설명 (예: 출석, 지각 등)
     */
    @Column(name = "description", nullable = false)
    private String description;

    public String getDescription() {
        return description;
    }

    public Long getCode() {
        return code;
    }
}
