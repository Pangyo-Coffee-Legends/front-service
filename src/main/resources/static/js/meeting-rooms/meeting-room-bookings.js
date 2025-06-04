const SERVER_URL = "https://aiot2.live";
const BOOKING_API_URL = `${SERVER_URL}/api/v1/bookings`;
const MEETING_ROOM_API_URL = `${SERVER_URL}/api/v1/meeting-rooms`;
const EARLY_ENTRY_MESSAGE = "예약 시간 10분 전부터 입장 가능합니다.";
const LATE_ENTRY_MESSAGE = "예약시간 10분 후까지만 입실 가능합니다.";

document.addEventListener("DOMContentLoaded", async () => {
    console.log("예약페이지 로딩 완료.");

    const pathSegments = window.location.pathname.split("/");
    const meetingRoomNo = pathSegments[2];

    // Java의 LocalDateTime 형식에 맞는 현재 날짜, 시간 정보 string
    const dateTimeString = getLocalDateTimeString();
    const dateTime = dateTimeString.split("T")[0];

    await getBookings(meetingRoomNo, dateTime);

    bindButtonHandler();

});

function bindButtonHandler() {
    document.querySelectorAll(".enter-code").forEach(e => e.addEventListener("click", onEnterCode));
    document.getElementById("modal-close").addEventListener("click", onModalClose);
    document.getElementById("modal-submit").addEventListener("click", onModalSubmit);

    document.getElementById("booking-code-input").addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById("modal-submit").click();
        }
    })
}

document.addEventListener("keydown", e => {
    const modal = document.getElementById("modal");

    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        onModalClose();
    }
})

function onEnterCode(e) {
    let selectedMeetingRoomNo = e.target.dataset.meetingRoomNo;
    let selectedBookingNo = e.target.dataset.bookingNo;

    openModal(selectedMeetingRoomNo, selectedBookingNo);
}

function onModalClose() {
    document.getElementById("modal").classList.add("hidden");
}

async function onModalSubmit() {
    let inputCode = document.getElementById("booking-code-input").value;

    let meetingRoomNo = document.getElementById("modal-submit").dataset.meetingRoomNo;
    let bookingNo = document.getElementById("modal-submit").dataset.bookingNo;

    await verifyBookingCode(meetingRoomNo, bookingNo, inputCode, getLocalDateTimeString());
}

function openModal(meetingRoomNo, bookingNo) {
    const modal = document.getElementById("modal");
    modal.classList.remove("hidden");

    const submitBtn = document.getElementById("modal-submit");
    submitBtn.setAttribute("data-meeting-room-no", meetingRoomNo);
    submitBtn.setAttribute("data-booking-no", bookingNo);

    document.getElementById("booking-code-input").focus();
}

async function verifyBookingCode(meetingRoomNo, selectedBookingNo, inputCode, entryTime) {

    let date = entryTime.split("T")[0];
    let time = entryTime.split("T")[1].substring(0, 5);

    const response = await fetch(`${MEETING_ROOM_API_URL}/verify`,
        {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                "bookingNo": selectedBookingNo,
                "entryTime": date.concat(" ", time),
                "code": inputCode
            })
        });

    const result = await response.json();

    console.log("result: ", result);

    if (result.statusCode === 200) {
        showMessage("success", result.message);

        setTimeout(() => {
            window.location.href = `/meeting-room/${meetingRoomNo}/${selectedBookingNo}/in-meeting`;
        }, 2000);
    } else if (result.statusCode === 404) {
        showMessage("not_found", result.message)
    } else if (result.statusCode === 400) {
        if (result.message === EARLY_ENTRY_MESSAGE) {
            showMessage("bad_request", result.message)
        } else if (result.message === LATE_ENTRY_MESSAGE) {
            showMessage("bad_request", result.message)
        }
    }

    console.log(result);
}

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
                Accept: "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("예약 정보를 가져오는 데 실패했습니다.");
        }

        const bookings = await response.json();

        const th = document.querySelector("thead");

        bookings.forEach(booking => {

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
            enterBtn.setAttribute("class", "enter-code");
            enterBtn.innerText = "입실";

            td6.append(enterBtn);

            tr.append(td1, td2, td3, td4, td5, td6);

            th.append(tr);
        })
    } catch (error) {
        console.log("예약정보 불러오기 실패: ", error);
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