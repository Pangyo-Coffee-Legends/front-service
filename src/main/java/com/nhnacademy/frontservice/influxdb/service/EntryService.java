package com.nhnacademy.frontservice.influxdb.service;


import com.nhnacademy.frontservice.influxdb.EntryCountDto;

import java.util.List;

/**
 * 출입 기록 데이터를 조회하는 서비스 인터페이스입니다.
 *
 * <p>InfluxDB 등 외부 데이터 소스로부터 출입 관련 통계 데이터를 가져오는 기능을 정의합니다.</p>
 */
public interface EntryService {

    /**
     * 최근 30일간의 일별 출입 횟수를 조회합니다.
     *
     * <p>센서 데이터를 기반으로 일별 출입 활동을 카운트하여,
     * 날짜별 출입 횟수를 포함하는 DTO 리스트를 반환합니다.</p>
     *
     * @return {@link EntryCountDto} 객체 리스트. 각 객체는 날짜와 해당 날짜의 출입 횟수를 포함합니다.
     */
    List<EntryCountDto> getMonthlyEntryCounts();
}
