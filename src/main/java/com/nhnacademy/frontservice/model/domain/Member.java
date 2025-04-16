package com.nhnacademy.frontservice.model.domain;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

/**
 * 회원 정보를 저장하는 JPA 엔티티입니다.
 * <p>
 * 이 엔티티는 회원의 고유 번호, 이름, 이메일, 비밀번호, 전화번호, 역할(Role),
 * 생성일자 및 탈퇴일자와 같은 회원 정보를 포함합니다. 또한, 회원은 하나의 역할을 가질 수 있습니다.
 * </p>
 */
@Entity
@Table(name = "members")
@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class Member {

    /**
     * 회원 고유 번호입니다.
     * 이 필드는 각 회원을 고유하게 식별하며, 자동으로 생성됩니다.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mb_no")
    @Comment("회원번호") // Hibernate 전용 어노테이션
    private Long mbNo;

    /**
     * 회원의 역할을 나타냅니다.
     * 회원은 하나의 역할을 가지며, 역할은 {@link Role} 엔티티와 다대일 관계입니다.
     */
    @ManyToOne
    @JoinColumn(name = "role_no", nullable = false)
    private Role role;

    /**
     * 회원의 이름입니다.
     * 회원의 이름은 50자 이내로 설정됩니다.
     */
    @Column(name = "mb_name", nullable = false, length = 50)
    @Comment("회원명")
    private String mbName;

    /**
     * 회원의 이메일 주소입니다.
     * 이메일은 중복을 허용하지 않으며, 회원을 식별하는 중요한 정보입니다.
     */
    @Column(name = "mb_email", nullable = false, length = 100)
    @Comment("이메일")
    private String mbEmail;

    /**
     * 회원의 비밀번호입니다.
     * <p>
     * 비밀번호는 평문으로 저장되지 않으며, 해시 처리 후 저장됩니다. 보안을 위해 {@code toString()} 메서드에서 제외됩니다.
     * </p>
     */
    @ToString.Exclude
    @Column(name = "mb_password", nullable = false, length = 200)
    @Comment("비밀번호")
    private String mbPassword;

    /**
     * 회원의 전화번호입니다.
     * 전화번호는 15자 이내로 설정됩니다.
     */
    @Column(name = "phone_number",nullable = false, length = 15)
    @Comment("전화번호")
    private String phoneNumber;

    /**
     * 회원의 계정 생성일자입니다.
     * 회원이 가입할 때 자동으로 생성되며, {@link PrePersist} 메서드에서 초기화됩니다.
     */
    @Column(name = "created_at", nullable = false)
    @Comment("생성일자")
    private LocalDateTime createdAt;

    /**
     * 회원의 탈퇴일자입니다.
     * 회원이 탈퇴하면 해당 필드가 현재 시각으로 설정됩니다. 실제 DB 삭제가 아닌 소프트 딜리트용으로 사용됩니다.
     */
    @Column(name = "withdraw_at")
    @Comment("탈퇴일자")
    private LocalDateTime withdrawnAt;

    /**
     * 회원 객체를 생성하는 인자 생성자입니다.
     * <p>
     * 이 생성자는 {@link Member#ofNewMember(String, String, String, String)}와 같은
     * 정적 팩토리 메서드에서만 호출 가능합니다.
     * 외부에서 직접 호출할 수 없습니다.
     * </p>
     *
     * @param mbName      회원명
     * @param mbEmail     회원 이메일
     * @param mbPassword  회원 비밀번호
     * @param phoneNumber 회원 전화번호
     */
    private Member(String mbName, String mbEmail, String mbPassword, String phoneNumber) {
        this.mbName = mbName;
        this.mbEmail = mbEmail;
        this.mbPassword = mbPassword;
        this.phoneNumber = phoneNumber;
    }

    /**
     * 회원 생성에 사용되는 정적 팩토리 메서드입니다.
     * <p>
     * 이 메서드는 새로운 회원을 생성하기 위한 간편한 방법을 제공합니다.
     * </p>
     *
     * @param mbName      회원 이름
     * @param mbEmail     회원 이메일
     * @param mbPassword  회원 비밀번호
     * @param phoneNumber 회원 전화번호
     * @return 새로운 회원 객체
     */
    public static Member ofNewMember(String mbName, String mbEmail, String mbPassword, String phoneNumber) {
        return new Member(mbName, mbEmail, mbPassword, phoneNumber);
    }

    /**
     * 회원 정보가 데이터베이스에 저장되기 전에 호출되는 메서드입니다.
     * 이 메서드는 생성일자를 자동으로 설정합니다.
     */
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * 회원 탈퇴를 처리하는 메서드입니다.
     * 탈퇴 시 탈퇴일자가 현재 시각으로 설정됩니다.
     */
    public void withdraw() {
        this.withdrawnAt = LocalDateTime.now();
    }

    /**
     * 회원에게 역할을 부여하는 메서드입니다.
     * <p>
     * 이 메서드는 {@link Role} 엔티티를 회원에게 할당합니다.
     * </p>
     *
     * @param role 부여할 역할
     */
    public void assignRole(Role role) {
        this.role = role;
    }

    public Long getMbNo() {
        return mbNo;
    }

    public Role getRole() {
        return role;
    }

    public String getMbName() {
        return mbName;
    }

    public String getMbEmail() {
        return mbEmail;
    }

    public String getMbPassword() {
        return mbPassword;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getWithdrawnAt() {
        return withdrawnAt;
    }

    /**
     * 해당 회원이 탈퇴 상태인지 확인합니다.
     *
     * @return 탈퇴일자(withdrawnAt)가 null이 아니면 true, 그렇지 않으면 false
     */
    public boolean isWithdrawn() {
        return this.withdrawnAt != null;
    }

}
