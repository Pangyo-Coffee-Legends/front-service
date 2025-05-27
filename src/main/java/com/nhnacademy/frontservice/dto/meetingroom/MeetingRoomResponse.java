package com.nhnacademy.frontservice.dto.meetingroom;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Value;

@RequiredArgsConstructor
@Getter
public class MeetingRoomResponse {

    private final Long no;

    private final String meetingRoomName;

    private final int meetingRoomCapacity;

}