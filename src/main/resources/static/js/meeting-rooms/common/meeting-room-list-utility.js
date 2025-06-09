export const SERVER_URL = "https://aiot2.live";
export const MEETING_ROOM_API = `${SERVER_URL}/api/v1/meeting-rooms`;

export async function fetchMeetingRooms(apiUrl) {
    const response = await fetch(`${MEETING_ROOM_API}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json"
            },
            credentials: "include"
        });

    return await response.json();
}

export function renderMeetingRooms(meetingRoomList, tbody, { showActions = false} = {}) {
    tbody.innerHTML = "";

    meetingRoomList.forEach((room, index) => {
        const row = document.createElement("tr");

        const display = room.equipmentNames.includes("디스플레이")
            ? `<svg width="16" height="16"><circle cx="8" cy="8" r="6" stroke="#555" stroke-width="2" fill="none" /></svg>`
            : `<svg width="16" height="16"><line x1="4" y1="4" x2="12" y2="12" stroke="#555" stroke-width="2" /><line x1="12" y1="4" x2="4" y2="12" stroke="#555" stroke-width="2" /></svg>`;

        const digitalWhiteboard = room.equipmentNames.includes("디지털 화이트보드")
            ? `<svg width="16" height="16"><circle cx="8" cy="8" r="6" stroke="#555" stroke-width="2" fill="none" /></svg>`
            : `<svg width="16" height="16"><line x1="4" y1="4" x2="12" y2="12" stroke="#555" stroke-width="2" /><line x1="12" y1="4" x2="4" y2="12" stroke="#555" stroke-width="2" /></svg>`;

        const videoSystem = room.equipmentNames.includes("화상회의 시스템")
            ? `<svg width="16" height="16"><circle cx="8" cy="8" r="6" stroke="#555" stroke-width="2" fill="none" /></svg>`
            : `<svg width="16" height="16"><line x1="4" y1="4" x2="12" y2="12" stroke="#555" stroke-width="2" /><line x1="12" y1="4" x2="4" y2="12" stroke="#555" stroke-width="2" /></svg>`;

        row.innerHTML = `
            <td>${room.no}</td>
            <td>${room.meetingRoomName}</td>
            <td>${room.meetingRoomCapacity}</td>
            <td>${display}</td>
            <td>${digitalWhiteboard}</td>
            <td>${videoSystem}</td>
            ${showActions ? `
                <td>
                    <button class="edit-btn" data-room-no="${room.no}">변경</button>
                    <button class="delete-btn" data-room-no="${room.no}">삭제</button>
                </td>` : ""}
            `;

        tbody.appendChild(row);
    });
}