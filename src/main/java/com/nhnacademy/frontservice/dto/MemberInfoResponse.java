package com.nhnacademy.frontservice.dto;

import lombok.Value;


@Value
public class MemberInfoResponse {

    Long no;
    String name;
    String email;
    String phoneNumber;
}
