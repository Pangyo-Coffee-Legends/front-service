const SERVER_URL = "http://localhost:10251";
const MEETING_ROOM_API = `${SERVER_URL}/api/v1/meeting-rooms`
const MEETING_ROOM_EQUIPMENT_API = `${SERVER_URL}/api/v1/meeting-rooms/equipments`;

document.addEventListener("DOMContentLoaded", async () => {
    const equipmentContainer = document.querySelector(".form-check").parentElement;

    try {

        const response = await fetch(`${MEETING_ROOM_EQUIPMENT_API}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json"
                },
                credentials: "include"
            });

        const equipments = await response.json();

        // ✅ 동적으로 checkbox 생성
        equipmentContainer.innerHTML = ""; // 기존 하드코딩된 것 제거
        equipments.forEach(equipment => {
            const checkboxDiv = document.createElement("div");
            checkboxDiv.className = "form-check";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "form-check-input";
            checkbox.id = `equipment-${equipment.equipmentNo}`;
            checkbox.name = "equipment";
            checkbox.value = equipment.equipmentNo;

            const label = document.createElement("label");
            label.className = "form-check-label";
            label.htmlFor = checkbox.id;
            label.textContent = equipment.equipmentName;

            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            equipmentContainer.appendChild(checkboxDiv);
        });

    } catch (error) {
            console.error("기자재 로딩 실패: ", error);
    }

    document.getElementById("register-btn").addEventListener("click", async (e) => {
        console.log("submit 이벤트 감지");
        e.preventDefault();

        const meetingRoomName = document.getElementById("meeting-room-name").value.trim();
        const meetingRoomCapacity = parseInt(document.getElementById("meeting-room-capacity").value);

        const equipmentCheckboxes = document.querySelectorAll("input[name=equipment]:checked");
        const selectedEquipmentIds = Array.from(equipmentCheckboxes).map(checkbox => checkbox.value);

        const registerRequest = {
            meetingRoomName: meetingRoomName,
            meetingRoomCapacity: meetingRoomCapacity,
            equipmentIds: selectedEquipmentIds
        }

        try {
            const response = await fetch(`${MEETING_ROOM_API}/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(registerRequest)
                });

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "회의실 등록 완료",
                    text: "회의실이 성공적으로 등록되었습니다.",
                    confirmButtonText: "확인",
                }).then(() => {
                    window.location.href = "/admin/meeting-room/list";
                });
            }
        } catch (error) {
            console.error("기자재 등록 실패: ", error);
        }

    })

})