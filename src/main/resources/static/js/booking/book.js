'use strict';

const api = apiStore();
const format = formatStore();


const id = window.location.search.split("=");
let selectedDate = new Date().toISOString().split('T')[0];
let selectedStartTime = null;
let selectedEndTime = null;
let selectedRange = [];
let selectedRoom = null;

document.addEventListener('DOMContentLoaded', async () => {

    console.log(window.location.pathname);

    if(id[0] === "?roomNo"){
        selectedRoom = id[1];

    }
    if(id[0] === "?id") {
        await getRooms();
        await update();
    }
    getCalendar();
    getAlert();
});


const update = async function () {
    const data = await api.getBooking(id[1]);

    selectedRoom = data.room.no;
    selectedDate = data.startsAt.split('T')[0];
    selectedStartTime = format.dateExtractTime(new Date(data.startsAt));
    const endTime = format.dateExtractTime(new Date(data.finishesAt));

    selectedEndTime = endTime;
    highlightTimeRange();

    document.getElementById("attendees").value = data.attendeeCount;

    const roomButtons = document.querySelectorAll('.room-button');
    roomButtons.forEach(btn => {
        if (btn.value === selectedRoom) {
            btn.style.backgroundColor = '#357ac8';
        }
    });

    await getBookings(selectedRoom, selectedDate);
    getDate(selectedDate);
};

async function getRooms(){
    const button = document.querySelector('.rooms');
    const response = await api.getMeetingRooms();

    response.forEach(data => {
        button.innerHTML += `
            <button class="room-button selected" value="${data.no}" onclick="selectRoom(this)">
                <span class="room-name">${data.meetingRoomName}</span><br/>
                <span class="room-capacity">수용 인원: ${data.meetingRoomCapacity}</span>
            </button>
        `;
    });
}

function selectRoom(button) {
    resetUI();
    getDate(selectedDate);
    button.style.backgroundColor = '#357ac8';
    selectedRoom = button.value;
}

function resetUI(){
    const buttons = document.querySelectorAll('.room-button');
    buttons.forEach(btn => btn.style.backgroundColor = '');

    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('selected-time', 'in-range');
    });

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.value = '');

    selectedStartTime = null;
    selectedEndTime = null;
    selectedRange = [];
}

// 캘린더
const getCalendar = function (){
    const calendarEl = document.getElementById('calendar');

    console.log('a', selectedRoom);
    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ko',
        headerToolbar: {
            left: 'prev',
            center: 'title',
            right: 'today next'
        },
        dateClick: async function(info){
            getDate(info.dateStr);

            if(selectedRoom && info.dateStr) {
                await getBookings(selectedRoom, info.dateStr);
            }
            document.querySelectorAll('.fc-day').forEach(cell => {
                cell.style.backgroundColor = '';
            });
            info.dayEl.style.backgroundColor = '#e6f0ff'; // #bed5fa
        }
    });

    calendar.render();
};

// 오늘 이전/이후 시간 disabled 처리
const getDate = function (dateStr) {
    const timeSlots = document.querySelectorAll('.time-slot');

    const now = new Date();
    selectedDate = dateStr;

    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = selected.getTime() === today.getTime();
    const isPast = selected < today;

    if (isToday) {
        timeSlots.forEach(slot => {
            const timeText = slot.textContent.trim().replace(/[^\d:]/g, '');
            const slotTime = format.timeAsDate(timeText);
            slot.disabled = slotTime < now;
        });
    } else if (isPast){
        timeSlots.forEach(slot => slot.disabled = true);
    } else {
        timeSlots.forEach(slot => slot.disabled = false);
    }
};

// 예약된 시간 disabled
const getBookings = async function (roomNo, dateStr) {
    const response = await api.getDailyBookings(roomNo, dateStr);
    const bookedTimes = new Set();

    response.forEach(data => {
        const startTime = new Date(`1970-01-01T${data.startsAt.split('T')[1]}`);
        const endTime = new Date(`1970-01-01T${data.finishesAt.split('T')[1]}`);

        let current = new Date(startTime);
        while (current < endTime) {
            bookedTimes.add(format.dateExtractTime(current));
            current.setMinutes(current.getMinutes() + 30);
        }
    });

    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        const timeText = slot.textContent.trim();
        if (bookedTimes.has(timeText)) {
            slot.disabled = true;
            slot.classList.add('booked');
        }
    });
};

// 시간 선택 (시작, 종료)
const selectTime = function (button){
    const clickedTime = button.textContent.trim();

    // 이미 선택된 시간을 다시 클릭하면 무시
    if (clickedTime === selectedStartTime || clickedTime === selectedEndTime) {
        return;
    }

    if (!selectedStartTime) {
        selectedStartTime = clickedTime;
        button.classList.add('selected-time');
        highlightTimeRange();

    } else if (!selectedEndTime) {
        selectedEndTime = clickedTime;

        const start = format.timeAsDate(selectedStartTime);
        const end = format.timeAsDate(selectedEndTime);

        if (start > end) {
            [selectedStartTime, selectedEndTime] = [selectedEndTime, selectedStartTime];
        }

        highlightTimeRange();
    } else {
        resetTimeSelection();
        selectedStartTime = clickedTime;
        button.classList.add('selected-time');
    }
};

function resetTimeSelection() {
    selectedStartTime = null;
    selectedEndTime = null;
    selectedRange = [];

    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(btn => {
        btn.classList.remove('selected-time', 'in-range');
    });

    document.getElementById("startTimeDisplay").textContent = '-';
    document.getElementById("endTimeDisplay").textContent = '-';
}

function highlightTimeRange() {
    const timeSlots = document.querySelectorAll('.time-slot');
    selectedRange = [];

    // 시간 영역 초기화
    timeSlots.forEach(slot => {
        slot.classList.remove('selected-time', 'in-range');
    })

    console.log(selectedStartTime);

    if (selectedStartTime) {
        let tempEndTime = selectedEndTime;

        if (!tempEndTime) {
            const startDate = format.timeAsDate(selectedStartTime);
            startDate.setHours(startDate.getHours() + 1);
            tempEndTime = format.dateExtractTime(startDate);
        }

        timeSlots.forEach(slot => {
            const time = slot.textContent.trim();

            if (time === selectedStartTime || time === tempEndTime) {
                slot.classList.add('selected-time');
                selectedRange.push(time);
            } else {
                const current = format.timeAsDate(time);
                const start = format.timeAsDate(selectedStartTime);
                const end = format.timeAsDate(tempEndTime);

                if (start && end && current > start && current < end) {
                    slot.classList.add('in-range');
                    selectedRange.push(time);
                }
            }
        });

        // 시간 표시
        document.getElementById("startTimeDisplay").textContent = selectedStartTime;
        document.getElementById("endTimeDisplay").textContent = tempEndTime;
    } else {
        document.getElementById("startTimeDisplay").textContent = '-';
        document.getElementById("endTimeDisplay").textContent = '-';
    }
}


// 예약 버튼 이벤트
function getAlert(){
    const reserveBtn = document.getElementById("reserveBtn");
    console.log('selectedRoom', selectedRoom);
    reserveBtn.addEventListener('click', () => {
        let attendees = document.getElementById("attendees").value;
        if(selectedDate && selectedStartTime && attendees && selectedRoom){
            Swal.fire({
                title: "예약 사용 설명",
                icon: "info",
                html: `
                    <p> 
                        예약 연장: 최초 1회 가능 <br/>
                        1회 연장 가능 시간: 1시간<br/>
                        <b>‘예약 코드'</b>를 입력해야 입실 가능합니다.<br/>
                        퇴실 시 <b>‘회의 종료'</b> 클릭 후 퇴실<br/>
                        예약 시작 10분 이내 미입장시 자동 취소<br/><br/>
                        회의실 사용 설명을 숙지하였고,<br/>
                        위 내용에 동의합니다. <br/>
                    </p>`,
                showCancelButton: true,
                confirmButtonText: '예약 확정하기',
                confirmButtonColor: '#4a90e2',
                cancelButtonText: '돌아가기',
                preConfirm: async () => {
                    const data = {
                        roomNo: selectedRoom,
                        date: selectedDate,
                        // startTime: format.to24Hour(selectedStartTime),
                        // finishTime: format.to24Hour(selectedEndTime),
                        startTime: selectedStartTime,
                        finishTime: selectedEndTime,
                        attendeeCount: Number(attendees)
                    };

                    try{
                        let response;
                        if(id[0] === "?id") {
                            response = await api.updateBooking(id[1], data);
                        } else {
                            response = await api.registerBooking(data);
                        }
                        window.location.href = `/booking/success?id=${response.no}`;
                    } catch (error) {
                        Swal.showValidationMessage(`${error.message}`);
                    }
                }
            });
        } else {
            let missingFields = [];

            if (!selectedRoom) missingFields.push("회의실");
            if (!selectedDate) missingFields.push("날짜");
            if (!selectedStartTime) missingFields.push("시간");
            if (!attendees) missingFields.push("인원 수");

            Swal.fire({
                icon: 'warning',
                title: '입력 누락',
                text: `${missingFields.join(', ')}를(을) 입력해주세요.`,
                confirmButtonColor: '#4a90e2',
            });
        }
    });
}
