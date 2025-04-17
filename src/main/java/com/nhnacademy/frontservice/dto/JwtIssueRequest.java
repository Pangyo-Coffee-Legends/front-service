package com.nhnacademy.frontservice.dto;

import lombok.*;

@ToString
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class JwtIssueRequest {
    private String email;
    private String role;
}
