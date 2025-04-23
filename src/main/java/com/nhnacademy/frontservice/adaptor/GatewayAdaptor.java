package com.nhnacademy.frontservice.adaptor;

import com.nhnacademy.frontservice.dto.JwtIssueRequest;
import com.nhnacademy.frontservice.dto.JwtResponse;
import com.nhnacademy.frontservice.dto.MemberRegisterRequest;
import com.nhnacademy.frontservice.dto.MemberResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "gateway-service", url = "http://localhost:10251", path = "/api/v1")
public interface GatewayAdaptor {

    @PostMapping("/members")
    ResponseEntity<MemberResponse> registerMember(@RequestBody MemberRegisterRequest registerRequest);

    @GetMapping("/members/email/{mbEmail}")
    ResponseEntity<MemberResponse> getMemberByMbEmail(@PathVariable("mbEmail") String email);

    @PostMapping("/auth")
    ResponseEntity<JwtResponse> getJwtToken(@RequestBody JwtIssueRequest jwtIssueRequest);

    /**
     * member-service 에서 mbNo를 전달받기 위해서 추가
     * 이유는 근무 시간 통계에서 맴버정보를 불러와야하기 때문
     *
     * @param mbNo 회원 번호
     * @return
     */
    @GetMapping("/{mbNo}")
    ResponseEntity<MemberResponse> getMemberByMbNo(@PathVariable("mbNo") Long mbNo);

    /**
     * 전체 회원 목록을 조회합니다.
     * <p>
     * 이 메서드는 member-service를 통해 현재 등록된 모든 회원의 정보를 조회하는 용도로 사용됩니다.
     * 일반적으로 관리자 페이지나 통계 화면 등에서 사용자 리스트를 출력할 때 사용되며,
     * 반환되는 정보에는 회원 번호(mbNo), 이름(mbName), 이메일(mbEmail)등의
     * 프로필 정보가 포함됩니다.
     * </p>
     *
     * @return 회원 정보를 담은 {@link MemberResponse} 리스트를 {@link ResponseEntity} 형태로 반환합니다.
     *         조회된 회원이 없을 경우 빈 리스트를 반환합니다.
     */
    @GetMapping("/members")
    ResponseEntity<List<MemberResponse>> getAllMembers();

}
