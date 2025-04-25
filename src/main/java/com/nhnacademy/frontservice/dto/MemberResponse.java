package com.nhnacademy.frontservice.dto;

import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * 회원 정보를 조회하는 DTO 클래스입니다.
 * <p>
 * 이 클래스는 클라이언트가 회원의 정보를 조회할 때 응답 형식으로 사용되며,
 * 회원의 역할, 이름, 이메일, 전화번호 등의 정보를 포함합니다.
 * </p>
 */
@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class MemberResponse {
    private Long no;

    private String roleName;

    private String name;

    private String email;

    private String password;

    private String phoneNumber;

    public MemberResponse(Long no, String roleName, String name, String email, String password, String phoneNumber) {
        this.no = no;
        this.roleName = roleName;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
    }

    public Long getNo() {
        return no;
    }

    public String getRoleName() {
        return roleName;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }
}

