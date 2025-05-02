package com.nhnacademy.frontservice.dto.token;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@ToString
@Getter
@NoArgsConstructor
public class TokenRequest {
    private  String token;

    public TokenRequest(@JsonProperty("token") String token) {
        this.token = token;
    }
}
