package com.nhnacademy.frontservice.dto.member;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@NoArgsConstructor
@EqualsAndHashCode
public class MemberUpdatePasswordRequest {

    @ToString.Exclude
    @NotBlank
    @Size(min = 8, max = 200)
    private String oldPassword;


    @ToString.Exclude
    @NotBlank
    @Size(min = 8, max = 200)
    private String newPassword;

    @ToString.Exclude
    @NotBlank
    @Size(min = 8, max = 200)
    private String newConfirmPassword;

    public MemberUpdatePasswordRequest(
            String oldPassword,
            String newPassword,
            String newConfirmPassword
    ) {
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
        this.newConfirmPassword = newConfirmPassword;
    }

    /**
     * 비밀번호와 비밀번호 재확인이 일치하는지를 검증합니다.
     *
     * @return 두 필드가 동일하면 {@code true}, 그렇지 않으면 {@code false}
     */
    public boolean isPasswordValid() {
        return newPassword.equals(newConfirmPassword);
    }

    public String getOldPassword() {
        return oldPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public String getNewConfirmPassword() {
        return newConfirmPassword;
    }
}
