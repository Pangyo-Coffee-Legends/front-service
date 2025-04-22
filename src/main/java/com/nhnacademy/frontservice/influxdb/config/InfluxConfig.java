package com.nhnacademy.frontservice.influxdb.config;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.InfluxDBClientFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * InfluxDB 클라이언트 빈을 생성하는 설정 클래스입니다.
 * InfluxDB에 연결하기 위한 기본 URL, 토큰, 조직명, 버킷명을 설정합니다.
 */
@Configuration
public class InfluxConfig {
    private static final String TOKEN = "VNFU9_2LZAkeF299VqVqTI6UL7kKqYfvyy4qeesEXnqlEIIl2W6fNMznsBZI15BKopp2wMB5kfk7xexzJhHgJw==";
    private static final String BUCKET = "coffee-mqtt";
    private static final String ORG = "aiot2-team2-coffee";
    private static final String URL = "https://influx.aiot2.live/";

    /**
     * InfluxDBClient 빈을 생성합니다.
     *
     * @return InfluxDBClient 인스턴스
     */
    @Bean
    public InfluxDBClient influxDBClient() {
        return InfluxDBClientFactory.create(URL, TOKEN.toCharArray(), ORG, BUCKET);
    }
}
