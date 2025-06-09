package com.nhnacademy.frontservice.dto.meetingroom;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class MeetingRoomUpdateRequest {

    private String meetingRoomName;

    private int meetingRoomCapacity;

    private List<Long> equipmentIds;
}