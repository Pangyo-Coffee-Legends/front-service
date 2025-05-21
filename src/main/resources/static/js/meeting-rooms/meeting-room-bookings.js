const SERVER_URL = "http://localhost:10251";
const BOOKING_API_URL = `${SERVER_URL}/api/v1/bookings`;
const MEETING_ROOM_API_URL = `${SERVER_URL}/api/v1/meeting-rooms`;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("예약페이지 로딩 완료.");

    const pathSegments = window.location.pathname.split("/");
    const meetingRoomNo = pathSegments[2];

    // Java의 LocalDateTime 형식에 맞는 현재 날짜, 시간 정보 string
    const dateTimeString = getLocalDateTimeString();

    const testDate = "2025-05-11";

    await getBookings(meetingRoomNo, testDate);

    let selectedMeetingRoomNo = null;
    let selectedBookingNo = null;
    let email = null;

    document.addEventListener("click", async (e) => {

        if (e.target.tagName === "BUTTON" && e.target.id === "enter-code") {
            selectedMeetingRoomNo = e.target.dataset.meetingRoomNo;
            selectedBookingNo = e.target.dataset.bookingNo;

            console.log("입실 selectedMeetingRoomNo: ", selectedMeetingRoomNo);
            console.log("입실 selectedBookingNo: ", selectedBookingNo);

            openModal(selectedMeetingRoomNo, selectedBookingNo);
        }

        if (e.target.id === "modal-close") {
            closeModal();
        }

        if (e.target.id === "modal-submit") {
            let inputCode = document.getElementById("booking-code-input").value;
            console.log(inputCode);

            email = "test@test.com"; // 테스트를 위해 test 계정 부여. 추후 실제 사용자의 email을 받아오는 코드로 refactoring 필요함.

            let meetingRoomNo = document.getElementById("modal-submit").dataset.meetingRoomNo;
            let bookingNo = document.getElementById("modal-submit").dataset.bookingNo;

            console.log(meetingRoomNo);
            console.log(bookingNo);

            await verifyBookingCode(email, meetingRoomNo, bookingNo, inputCode, "2025-05-11T13:30:00");
        }
    })

});

// format: yyyy-MM-dd`T`HH:mm:ss (Java의 LocalDateTime 형식을 맞추기 위함)
function getLocalDateTimeString() {
    const now = new Date();
    const korea = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));

    const year = korea.getFullYear();
    const month = String(korea.getMonth() + 1).padStart(2, "0");
    const day = String(korea.getDate()).padStart(2, "0");

    const hours = String(korea.getHours()).padStart(2, "0");
    const minutes = String(korea.getMinutes()).padStart(2, "0");
    const seconds = String(korea.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

async function getBookings(meetingRoomNo, date) {
    try {
        const response = await fetch(`${BOOKING_API_URL}/meeting-rooms/${meetingRoomNo}/date/${date}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-USER": "test@test.com"
            }
        });

        if (!response.ok) {
            throw new Error("예약 정보를 가져오는 데 실패했습니다.");
        }

        const bookings = await response.json();

        console.log("회의실 번호: ", meetingRoomNo);
        console.log("현재날짜: ", date);
        console.log(bookings);

        const th = document.querySelector("thead");

        bookings.forEach(booking => {
            console.log(booking);

            const tr = document.createElement("tr");
            const td1 = document.createElement("td");
            td1.innerText = booking.no;

            const td2 = document.createElement("td");
            td2.innerText = booking.mbName;

            const td3 = document.createElement("td");
            td3.innerText = booking.attendeeCount;

            const td4 = document.createElement("td");

            const startDate = booking.startsAt.split("T")[0];
            const startTime = booking.startsAt.split("T")[1];

            td4.innerText = startDate.concat(" ", startTime);

            const td5 = document.createElement("td");

            const finishDate = booking.finishesAt.split("T")[0];
            const finishTime = booking.finishesAt.split("T")[1];

            td5.innerText = finishDate.concat(" ", finishTime);

            const td6 = document.createElement("td");
            const enterBtn = document.createElement("button");

            enterBtn.setAttribute("data-meeting-room-no", `${meetingRoomNo}`);
            enterBtn.setAttribute("data-booking-no", `${booking.no}`);
            enterBtn.setAttribute("id", "enter-code")
            enterBtn.innerText = "입실";

            td6.append(enterBtn);

            tr.append(td1, td2, td3, td4, td5, td6);

            th.append(tr);
        })
    } catch (error) {
        console.log("예약정보 불러오기 실패: ", error);
    }
}

function openModal(meetingRoomNo, bookingNo) {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");

    const submitBtn = document.getElementById("modal-submit");
    submitBtn.setAttribute("data-meeting-room-no", meetingRoomNo);
    submitBtn.setAttribute("data-booking-no", bookingNo);

    document.getElementById("booking-code-input").focus();
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}

async function verifyBookingCode(email,  meetingRoomNo, selectedBookingNo, inputCode, entryTime) {
    try {
        console.log("input code: ", inputCode);
        const response = await fetch(`${MEETING_ROOM_API_URL}/verify`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-USER": email
                },
                body: JSON.stringify({
                    "bookingNo": selectedBookingNo,
                    "code": inputCode,
                    "entryTime": "2025-05-11 13:30"
                })
            });

        if (!response.ok) {
            throw new Error("예약 코드가 일치하지 않습니다.")
        }

        const result = await response.json();

        showMessage("success", "입실이 완료되었습니다.");
        console.log(result);

    } catch (error) {
        showMessage("error", "예약 코드가 일치하지 않습니다.");
        console.error(error);

    }
}

function showMessage(type, text) {
    const msgBox = document.getElementById("message-box");
    msgBox.className = `message-box ${type}`;
    msgBox.textContent = text;
    msgBox.classList.remove("hidden");

    setTimeout(() => {
        msgBox.classList.add("hidden");
    }, 3000);
}