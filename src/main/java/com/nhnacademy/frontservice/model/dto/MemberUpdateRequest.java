package com.nhnacademy.frontservice.model.dto;


import com.nhnacademy.frontservice.model.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * 회원 정보를 담는 DTO 클래스입니다.
 * <p>
 * 이 클래스는 회원 정보 수정 시 사용됩니다.
 * 회원의 고유 식별자, 이름, 이메일, 전화번호, 역할 및 비밀번호 정보를 포함합니다.
 * </p>
 */
@NoArgsConstructor
@EqualsAndHashCode
public class MemberUpdateRequest {

    private Long mbNo;

    private Role role;

    @NotBlank
    @Size(max = 50)
    private String name;

    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @ToString.Exclude
    @NotBlank
    @Size(min = 8, max = 200)
    private String password;

    @NotBlank
    @Size(max = 15)
    private String phoneNumber;

    public MemberUpdateRequest(Long mbNo, Role role, String name, String email, String password, String confirmPassword, String phoneNumber) {
        this.mbNo = mbNo;
        this.role = role;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
    }

    public Long getMbNo() {
        return mbNo;
    }

    public Role getRole() {
        return role;
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
