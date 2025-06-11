import { SERVER_URL, MEETING_ROOM_API } from "./common/meeting-room-list-utility.js";

document.addEventListener("DOMContentLoaded", async() => {
    const urlParams = new URLSearchParams(location.search);
    const roomNo = urlParams.get("roomNo");

    const nameInput = document.getElementById("meeting-room-name");
    const capacityInput = document.getElementById("meeting-room-capacity");
    const editBtn = document.getElementById("edit-btn");
    const equipmentContainer = document.querySelector(".form-check").parentElement;

    try {
        const meetingRoomResponse = await fetch (`${MEETING_ROOM_API}/${roomNo}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json"
                },
                credentials: "include"
            });

        const meetingRoom = await meetingRoomResponse.json();
        nameInput.value = meetingRoom.meetingRoomName;
        capacityInput.value = meetingRoom.meetingRoomCapacity;

        const equipmentResponse = await fetch (`${MEETING_ROOM_API}/equipments`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json"
                },
                credentials: "include"
            });

        const equipmentList = await equipmentResponse.json();

        equipmentContainer.innerHTML = "";
        equipmentList.forEach(equipment => {
            const checkboxDiv = document.createElement("div");
            checkboxDiv.className = "form-check";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "form-check-input";
            checkbox.id = `equipment-${equipment.equipmentNo}`;
            checkbox.name = "equipment";
            checkbox.value = equipment.equipmentNo;
            if (meetingRoom.equipmentNames.includes(equipment.equipmentName)) {
                checkbox.checked = true;
            }

            const label = document.createElement("label");
            label.className = "form-check-label";
            label.htmlFor = checkbox.id;
            label.textContent = equipment.equipmentName;

            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            equipmentContainer.appendChild(checkboxDiv);
        });

        editBtn.addEventListener("click", async () => {

            const confirmResult = await Swal.fire({
                title: "회의실 내용을 변경하시겠습니까?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "예, 변경합니다",
                cancelButtonText: "아니오",
            });

            if (!confirmResult.isConfirmed) {
                return; // 사용자가 취소한 경우 아무것도 하지 않음
            }

            const selectedEquipments = Array.from(document.querySelectorAll("input[name=equipment]:checked"))
                .map(checkbox => checkbox.value);

            const updateRequest = {
                meetingRoomName: nameInput.value.trim(),
                meetingRoomCapacity: parseInt(capacityInput.value),
                equipmentIds: selectedEquipments
            };

            const response = await fetch(`${MEETING_ROOM_API}/${roomNo}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify(updateRequest)
                });

            if (response.ok) {
                await Swal.fire({
                    icon: "success",
                    title: "회의실 변경 완료",
                    text: "회의실 정보가 성공적으로 변경되었습니다.",
                    confirmButtonText: "확인"
                });
                window.location.href = "/admin/meeting-room/list";
            } else {
                Swal.fire({
                    icon: "error",
                    title: "변경 실패",
                    text: "서버에서 요청을 처리하지 못했습니다."
                });
            }
        });

    } catch (error) {
        console.error("변경 중 오류 발생: ", error);
        Swal.fire({
            icon: "error",
            title: "에러 발생",
            text: "변경 요청 중 문제가 발생했습니다."
        });
    }
})