const GATEWAY_BASE_URL = "http://localhost:10251";
const MEETING_ROOM_API_URL = `${GATEWAY_BASE_URL}/api/v1/meeting-rooms`;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("회의실 페이지가 로딩되었습니다.");
    await getMeetingRooms();
});

async function getMeetingRooms() {
    try {
        const response = await fetch(`${MEETING_ROOM_API_URL}/list`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("회의실 정보를 가져오는 데 실패했습니다.");
        }

        const rooms = await response.json();

        const roomGrid = document.getElementById("roomGrid");
        roomGrid.innerHTML = "";

        rooms.forEach(room => {
            console.log(room);
            const card = document.createElement("div");
            card.className = "room-card";
            card.textContent = `${room.meetingRoomName}`;

            card.onclick = () => {
                window.location.href = `/meeting-rooms/${room.no}/bookings`;
                console.log("회의실 클릭");
            };

            roomGrid.appendChild(card);
        })

    } catch (error) {
        console.error("회의실 불러오기 실패: ", error);
    }
}