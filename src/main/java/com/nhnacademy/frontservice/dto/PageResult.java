package com.nhnacademy.frontservice.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

import java.util.List;

@Getter
@ToString
@RequiredArgsConstructor
public class PageResult<T> {
    private final List<T> content;
    private final long totalElements;
    private final int totalPages;
}