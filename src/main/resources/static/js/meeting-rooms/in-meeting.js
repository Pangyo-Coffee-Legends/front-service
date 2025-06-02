const SERVER_URL = "http://localhost:10251";
const BOOKING_API_URL = `${SERVER_URL}/api/v1/bookings`;

document.addEventListener("DOMContentLoaded", async () => {
    const pathSegments = window.location.pathname.split("/");
    const bookingNo = pathSegments[3];

    const response = await fetch(`${BOOKING_API_URL}/${bookingNo}`,
        {
            method: "GET",
            headers: {
                "Accept": "application/json"
            },
            credentials: "include"
        });

    const bookingInfo = await response.json();

    const entryDateTime = new Date();
    const finishesAt = new Date(bookingInfo.finishesAt);

    const diffMillis = finishesAt - entryDateTime;
    let remainingSeconds = Math.floor(diffMillis / 1000);

    setInterval(() => {
        const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, '0');
        const seconds = String(remainingSeconds % 60).padStart(2, '0');
        document.getElementById("time-display").textContent = `${minutes}:${seconds}`;

        if (remainingSeconds > 0) {
            remainingSeconds--;
        } else {
            // TODO: 자동 회의 종료 로직 추가
            console.log("회의 자동 종료 처리");
        }
    }, 1000);

    document.querySelector(".extend-btn").addEventListener("click", () => {
        // TODO: 회의 연장 API 호출
        alert("회의를 연장합니다.");
    });

    document.querySelector(".end-btn").addEventListener("click", () => {
        // TODO: 회의 종료 API 호출
        alert("회의를 종료합니다.");
    });
});
