package com.nhnacademy.frontservice.attendance.entity;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 출결 기록 정보를 담는 엔티티입니다.
 */
@Entity
@Table(name = "attendance", uniqueConstraints = {@UniqueConstraint(columnNames = {"mb_no", "work_date"})})
@NoArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "no")
    private Long id;

    @Column(name = "mb_no", nullable = false)
    private Long mbNo;
    @Column(name = "mb_name")
    private String mbName;

    @Column(name = "work_date", nullable = false)
    private LocalDateTime workDate;

    @Column(name = "in_time", nullable = false)
    private LocalDateTime inTime;

    @Column(name = "out_time")
    private LocalDateTime outTime;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;


    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "code", nullable = false)
    private AttendanceStatus status;

    public Attendance(Long id, Long mbNo, LocalDateTime workDate, LocalDateTime inTime, LocalDateTime outTime, LocalDateTime createdAt, LocalDateTime updatedAt, AttendanceStatus status) {
        this.id = id;
        this.mbNo = mbNo;
        this.workDate = workDate;
        this.inTime = inTime;
        this.outTime = outTime;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.status = status;
    }

    public String getMbName() {
        return mbName;
    }


    public Long getId() {
        return id;
    }

    public Long getMbNo() {
        return mbNo;
    }


    public LocalDateTime getWorkDate() {
        return workDate;
    }


    public LocalDateTime getInTime() {
        return inTime;
    }


    public LocalDateTime getOutTime() {
        return outTime;
    }


    public AttendanceStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
