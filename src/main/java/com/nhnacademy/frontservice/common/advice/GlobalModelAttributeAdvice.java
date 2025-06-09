package com.nhnacademy.frontservice.common.advice;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

/**
 * 전역 모델 속성을 추가하기 위한 Controller Advice 클래스입니다.
 * <p>
 * 이 클래스는 모든 컨트롤러에 적용되며, 인증된 사용자의 이메일을 모델에 자동으로 추가합니다.
 * Spring Security의 {@link SecurityContextHolder}를 활용해 현재 인증 정보를 확인하고,
 * 사용자가 로그인 상태인 경우 해당 이메일을 모델에 주입합니다.
 * </p>
 *
 * @author 작성자명 (신현섭)
 * @since 1.0
 */
@ControllerAdvice
public class GlobalModelAttributeAdvice {

    /**
     * 인증된 사용자의 이메일을 모델에 추가합니다.
     * <p>
     * 이 메서드는 모든 컨트롤러 요청 전에 실행되며, 다음 조건을 충족할 때만 동작합니다:
     * <ul>
     *   <li>사용자가 인증된 상태</li>
     *   <li>익명 사용자(anonymousUser)가 아닌 경우</li>
     * </ul>
     * 모델에 추가된 이메일은 뷰에서 {@code userEmail}로 접근할 수 있습니다.
     * </p>
     *
     * @param model 컨트롤러에 전달될 모델 객체
     * @see SecurityContextHolder
     * @see Authentication
     */
    @ModelAttribute
    public void addUserEmailToModel(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String userEmail = auth.getName();
            String role = auth.getAuthorities().iterator().next().getAuthority();
            model.addAttribute("userEmail", userEmail);
            model.addAttribute("role", role);
        }
    }
}
