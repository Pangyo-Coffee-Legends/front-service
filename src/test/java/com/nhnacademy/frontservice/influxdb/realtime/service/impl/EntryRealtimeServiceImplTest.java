package com.nhnacademy.frontservice.influxdb.realtime.service.impl;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class EntryRealtimeServiceImplTest {

    @Autowired
    private EntryRealtimeServiceImpl entryRealtimeService;

    @Test
    void getLatestEntry() {
        entryRealtimeService.getLatestEntry();

        assertAll(
                ()->
        );
    }
}