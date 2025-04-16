package com.nhnacademy.frontservice.model.domain;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.Comment;

import java.util.ArrayList;
import java.util.List;

/**
 * 권한 정보를 저장하는 JPA 엔티티입니다.
 * <p>
 * 이 엔티티는 사용자의 역할을 정의하는 역할을 합니다. 역할 번호, 역할 이름,
 * 역할 설명 등의 정보를 포함합니다.
 * </p>
 */
@Entity
@Table(name = "roles")
@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class Role {

    /**
     * 권한 고유 번호입니다.
     * 이 필드는 각 권한을 식별하는 데 사용됩니다.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_no", nullable = false)
    @Comment("권한번호")
    private Long roleNo;

    /**
     * 권한의 이름입니다. 예: "USER", "ADMIN".
     * 이 필드는 해당 권한의 이름을 나타내며, 사용자 권한을 정의하는 데 사용됩니다.
     */
    @Column(name = "role_name", nullable = false, length = 50)
    @Comment("권한명")
    private String roleName;

    /**
     * 권한에 대한 설명입니다.
     * 이 필드는 해당 권한의 상세 설명을 나타내며, 예를 들어 권한의 용도나 특징을 기록합니다.
     */
    @Column(name = "role_description", nullable = false, length = 200)
    @Comment("권한설명")
    private String roleDescription;

    /**
     * 이 권한을 가진 회원 목록입니다.
     * <p>
     * 이 컬렉션은 {@link Member} 엔티티와의 양방향 연관관계를 형성합니다.
     * 단, 이 필드는 읽기 전용이며, 연관관계의 주인은 Member 엔티티입니다.
     * 객체 간의 연관관계를 표현하기 위한 JPA의 개념이지, 실제 DB에 따로 컬럼이 생성되지 않습니다.
     * </p>
     */
    @OneToMany(mappedBy = "role")
    private List<Member> members = new ArrayList<>();

    /**
     * 전체 생성자입니다. 이 생성자는 역할 번호, 이름, 설명을 포함하여 권한 정보를 생성합니다.
     *
     * @param roleNo 권한 번호
     * @param roleName 권한 이름
     * @param roleDescription 권한 설명
     */
    public Role(Long roleNo, String roleName, String roleDescription) {
        this.roleNo = roleNo;
        this.roleName = roleName;
        this.roleDescription = roleDescription;
    }

    /**
     * 권한 정보를 업데이트하는 메서드입니다.
     * 이 메서드는 역할 이름과 역할 설명을 수정할 때 사용됩니다.
     *
     * @param roleName 수정할 권한 이름
     * @param roleDescription 수정할 권한 설명
     */
    public void update(String roleName, String roleDescription) {
        this.roleName = roleName;
        this.roleDescription = roleDescription;
    }

    public Long getRoleNo() {
        return roleNo;
    }

    public String getRoleName() {
        return roleName;
    }

    public String getRoleDescription() {
        return roleDescription;
    }

    public List<Member> getMembers() {
        return members;
    }
}