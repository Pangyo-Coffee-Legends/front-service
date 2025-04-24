package com.nhnacademy.frontservice.influxdb.realtime.service;

import com.nhnacademy.frontservice.influxdb.realtime.dto.EntryRealtimeDto;

/**
 * 실시간 출입 데이터를 처리하는 서비스 인터페이스입니다.
 * <p>
 * InfluxDB 또는 다른 실시간 데이터 저장소에서 가장 최근의 출입 데이터를 조회하는 기능을 제공합니다.
 * </p>
 */
public interface EntryRealtimeService {

    /**
     * 가장 최근의 출입 정보를 조회합니다.
     *
     * @return EntryRealtimeDto 객체로, 현재 시점 기준의 최신 출입 정보를 포함합니다.
     */
    EntryRealtimeDto getLatestEntry();
}
