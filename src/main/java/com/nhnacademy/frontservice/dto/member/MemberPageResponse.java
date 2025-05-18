package com.nhnacademy.frontservice.dto.member;

import lombok.Value;

import java.util.List;

@Value
public class MemberPageResponse {
    List<MemberInfoResponse> content;
    int totalPages;
    long totalElements;
    int currentPage;
}

