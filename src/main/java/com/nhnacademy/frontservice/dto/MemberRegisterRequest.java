package com.nhnacademy.frontservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * 회원 가입 요청을 담는 DTO 클래스입니다.
 * <p>
 * 이 클래스는 새로운 사용자의 회원 가입 요청 정보를 전달할 때 사용되며,
 * 일반 사용자 또는 관리자인지를 구분할 수 있는 역할 정보와
 * 이름, 이메일, 비밀번호, 전화번호 등의 필드를 포함합니다.
 * 또한, 비밀번호 재확인 기능을 통해 클라이언트 측에서 일치 여부를 사전에 검증할 수 있도록 지원합니다.
 * </p>
 */

@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class MemberRegisterRequest {

    private final String ROLE_NAME = "ROLE_USER";

    private String role;

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

    @ToString.Exclude
    @NotBlank
    @Size(min = 8, max = 200)
    private String confirmPassword;

    public MemberRegisterRequest(
            String name,
            String email,
            String password,
            String phoneNumber,
            String confirmPassword
    ) {
        this.role = ROLE_NAME;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.confirmPassword = confirmPassword;
    }

    /**
     * 비밀번호와 비밀번호 재확인이 일치하는지를 검증합니다.
     *
     * @return 두 필드가 동일하면 {@code true}, 그렇지 않으면 {@code false}
     */
    public boolean isPasswordValid() {
        return password.equals(confirmPassword);
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

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

}
