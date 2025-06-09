const GATEWAY_BASE_URL = "https://aiot2.live";
const MEETING_ROOM_API_URL = `${GATEWAY_BASE_URL}/api/v1/meeting-rooms`;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("회의실 페이지가 로딩되었습니다.");
    await getMeetingRooms();
});

async function getMeetingRooms() {
    try {
        const response = await fetch(`${MEETING_ROOM_API_URL}`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            credentials: "include"
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

            // 왼쪽: 회의실 이름 + 구분선 + 상세정보 묶는 container
            const mainInfo = document.createElement("div");
            mainInfo.className = "room-main";

            // 왼쪽: 회의실 이름
            const roomName = document.createElement("div");
            roomName.className = "room-name";
            roomName.textContent = room.meetingRoomName;

            // 중간: 세로 구분선
            const divider = document.createElement("div");
            divider.className = "room-divider";

            // 오른쪽: 회의실 상세 정보
            const info = document.createElement("div");
            info.className = "room-info";
            info.innerHTML = `
                수용 인원: ${room.meetingRoomCapacity ?? "알 수 없음"}명<br>
                기자재: ${
                room.equipmentNames.length > 0
                    ? room.equipmentNames.join(", ")
                    : "미등록"
            }
            `;

            mainInfo.append(roomName, divider, info);

            // 오른쪽 버튼 영역
            const buttonContainer = document.createElement("div");
            buttonContainer.className = "room-buttons";

            const reserveBtn = document.createElement("button");
            reserveBtn.className = "btn btn-reserve";
            reserveBtn.textContent = "예약";
            reserveBtn.onclick = (e) => {
                e.stopPropagation(); // 카드 클릭 방지
                window.location.href = `/booking?roomNo=${room.no}`;
            };

            const enterBtn = document.createElement("button");
            enterBtn.className = "btn btn-enter";
            enterBtn.textContent = "입실";
            enterBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.href = `/meeting-rooms/${room.no}/bookings`;
            };

            buttonContainer.append(reserveBtn, enterBtn);

            card.append(mainInfo, buttonContainer);

            roomGrid.appendChild(card);
        })

    } catch (error) {
        console.error("회의실 불러오기 실패: ", error);
    }
}