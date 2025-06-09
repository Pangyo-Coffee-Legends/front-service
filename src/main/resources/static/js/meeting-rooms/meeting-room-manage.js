import { fetchMeetingRooms, renderMeetingRooms, MEETING_ROOM_API } from "./common/meeting-room-list-utility.js";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("회의실 조회 페이지");

    const tbody = document.querySelector("tbody");

    try {
        const meetingRoomList = await fetchMeetingRooms();
        renderMeetingRooms(meetingRoomList, tbody, { showActions: true }); // showAction: default = false

        const editButtons = document.querySelectorAll(".edit-btn");
        editButtons.forEach(button => {
            button.addEventListener("click", () => {
                const roomNo = button.dataset.roomNo;
                window.location.href=`/admin/meeting-room/edit?roomNo=${roomNo}`;
            });
        });

        const deleteButtons = document.querySelectorAll(".delete-btn");
        deleteButtons.forEach(button => {
            button.addEventListener("click", async () => {
                const roomNo = button.dataset.roomNo;

                const response = await fetch(`${MEETING_ROOM_API}/${roomNo}`, {
                    method: "DELETE",
                    credentials: "include"
                });

                const result = await Swal.fire({
                    title: "회의실을 삭제하시겠습니까?",
                    text: "삭제하면 되돌릴 수 없습니다.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "네, 삭제합니다",
                    cancelButtonText: "취소"
                });

                if (!result.isConfirmed) {
                    return;
                }

                if (response.ok) {
                    await Swal.fire({
                        title: "삭제 완료",
                        text: "회의실이 성공적으로 삭제되었습니다.",
                        icon: "success",
                        confirmButtonText: "확인"
                    });

                    setTimeout(() => {
                        window.location.href = "/admin/meeting-room/list";
                    }, 1000);
                } else {
                    Swal.fire({
                        title: "삭제 실패",
                        text: "서버에서 요청을 처리하지 못했습니다.",
                        icon: "error"
                    });
                }
            })
        })

    } catch (error) {
        console.error("삭제 오류: ", error);
        Swal.fire({
            title: "에러 발생",
            text: "삭제 도중 문제가 발생했습니다.",
            icon: "error"
        });
    }
});