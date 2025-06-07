const SERVER_URL = "https://aiot2.live";
const BOOKING_API_URL = `${SERVER_URL}/api/v1/bookings`;

const pathSegments = window.location.pathname.split("/");
const meetingRoomNo = pathSegments[2];
const bookingNo = pathSegments[3];

document.addEventListener("DOMContentLoaded", async () => {

    const response = await fetch(`${BOOKING_API_URL}/${bookingNo}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json"
            },
            credentials: "include"
        });

    const bookingInfo = await response.json();

    console.log(bookingInfo);

    document.getElementById("booking-no").textContent = bookingInfo.no;
    document.getElementById("booking-member").textContent = bookingInfo.member.name;
    document.getElementById("attendees-count").textContent = bookingInfo.attendeeCount;

    const entryDateTime = new Date();
    const finishesAt = new Date(bookingInfo.finishesAt);

    const diffMillis = finishesAt - entryDateTime;
    let remainingSeconds = Math.floor(diffMillis / 1000);

    setInterval(async () => {
        const hours = String(Math.floor(remainingSeconds / 3600));
        const minutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(remainingSeconds % 60).padStart(2, '0');

        if (remainingSeconds >= 3600) {
            document.getElementById("time-display").textContent = `${hours}:${minutes}:${seconds}`;
        } else {
            document.getElementById("time-display").textContent = `${minutes}:${seconds}`;
        }

        if (remainingSeconds > 0) {
            remainingSeconds--;
        } else {
            // TODO: 자동 회의 종료 로직 추가
            const response = await fetch(`${BOOKING_API_URL}/${bookingNo}/finish`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json"
                    },
                    credentials: "include"
                });

            if (response.ok) {
                showToast("회의를 종료합니다.", "success");

                setTimeout(() => {
                    window.location.href = `/meeting-rooms/${meetingRoomNo}/bookings`;
                }, 2000);
            } else {
                showToast("자동 회의 종료 중 오류가 발생하였습니다.", "error");
            }
        }
    }, 1000);

    document.querySelector(".extend-btn").addEventListener("click", async () => {
        // TODO: 회의 연장 API 호출
        const response = await fetch(`${BOOKING_API_URL}/${bookingNo}/extend`,
            {
                method: "PUT",
                headers: {
                    Accept: "application/json"
                },
                credentials: "include"
            });

        console.log(response);

        const extendedBooking = await response.json();

        if (response.ok) {
            showToast("회의실 사용을 30분 연장합니다.", "success");

            const newFinishesAt = new Date(extendedBooking.finishesAt);
            remainingSeconds = Math.floor((newFinishesAt - entryDateTime) / 1000);

        } else {
            showToast("회의실 사용 연장이 불가합니다.", "error");
        }

    });

    document.querySelector(".end-btn").addEventListener("click", async () => {
        // TODO: 회의 종료 API 호출
        const response = await fetch(`${BOOKING_API_URL}/${bookingNo}/finish`,
            {
                method: "PUT",
                headers: {
                    Accept: "application/json"
                },
                credentials: "include"
            });

        if (response.ok) {
            showToast("회의를 종료합니다.", "success");

            setTimeout(() => {
                window.location.href = `/meeting-rooms/${meetingRoomNo}/bookings`;
            }, 2000);
        } else {
            showToast("회의 종료 중 오류가 발생하였습니다. 다시 시도해주세요.", "error");
        }

    });

    function showToast(message, type = "success") {
        const toast = document.getElementById("toast");
        toast.textContent = message;

        // type이 success지만 message에 '회의를 종료합니다'가 포함된 경우는 end 클래스로 처리
        if (type === "success" && message.includes("회의를 종료합니다")) {
            toast.className = "toast end show";
        } else {
            toast.className = `toast ${type} show`;
        }

        setTimeout(() => {
            toast.classList.remove("show");
        }, 2000);
    }

});
