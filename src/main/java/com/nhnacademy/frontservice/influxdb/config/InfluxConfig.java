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
    private static final String TOKEN = "RmaabELI9VpYPRu4nt_xBZX5l3Gv5lx8XnR4mVZnqep4Ya3eYrfpLUk4Y4dYE4J0mlcFHFPLUCKh8a4jq_lMNw==";
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
