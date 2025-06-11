import { fetchMeetingRooms, renderMeetingRooms } from "./common/meeting-room-list-utility.js";

document.addEventListener("DOMContentLoaded", async () => {
    // console.log("회의실 조회 페이지");

    const tbody = document.querySelector("tbody");

    try {
        const meetingRoomList = await fetchMeetingRooms();
        renderMeetingRooms(meetingRoomList, tbody); // showAction: default = false
    } catch (error) {
        console.error("회의실 목록 로딩 실패: ", error);
    }
});