'use strict';

const api = apiStore();
const format = formatStore();

const id = window.location.search.split("=")[1];
let selectedDate = new Date().toISOString().split('T')[0];
let selectedTime = null;
let selectedRoom = null;

document.addEventListener('DOMContentLoaded', async () => {
    await getRooms();
    if(id) {
        await update();
    }
    getCalendar();
    getAlert();
})


const update = async function () {
    const data = await api.getBooking(id);

    selectedRoom = data.room.no;
    selectedDate = data.startsAt.split('T')[0];
    selectedTime = format.dateExtractTime(new Date(data.startsAt));

    document.getElementById("attendees").value = data.attendeeCount;

    const timeButtons = document.querySelectorAll('.time-slot');
    timeButtons.forEach(btn => {
        if (btn.textContent.trim() === selectedTime) {
            btn.style.backgroundColor = '#e6f0ff';
            btn.style.color = 'black';
            btn.style.fontWeight = 'bold';
        }
    });

    const roomButtons = document.querySelectorAll('.room-button');
    roomButtons.forEach(btn => {
        if (btn.value === selectedRoom) {
            btn.style.backgroundColor = '#357ac8';
        }
    });

    await getBookings(selectedRoom, selectedDate);
    getDate(selectedDate);
}

async function getRooms(){
    const button = document.querySelector('.rooms');
    const response = await api.getMeetingRooms();

    response.forEach(data => {
        button.innerHTML += `
                    <button class="room-button selected" value="${data.no}" onclick="selectRoom(this)">
                        <span class="room-name">${data.meetingRoomName}</span> <br/>
                        <span class="room-capacity">수용 인원: ${data.meetingRoomCapacity}</span>
                    </button>
                `;
    })


}

function selectRoom(button) {
    resetUI();
    getDate(selectedDate); // 기본값
    button.style.backgroundColor = '#70a1da';
    selectedRoom = button.value;
}

function resetUI(){
    const buttons = document.querySelectorAll('.room-button');
    buttons.forEach(btn => {
        btn.style.backgroundColor = '';
    });

    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(btn => {
        btn.disabled = false;
    });

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.value = '');
}

// 캘린더
const getCalendar = function (){
    const calendarEl = document.getElementById('calendar');

    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ko',
        headerToolbar: {
            left: 'prev',
            center: 'title',
            right: 'today next'
        },
        // selectable: true,
        dateClick: async function(info){

            getDate(info.dateStr);

            if(selectedRoom && info.dateStr) {
                await getBookings(selectedRoom, info.dateStr);
            }

            document.querySelectorAll('.fc-day').forEach(cell => {
                cell.classList.remove('selected-day');
            });

            info.dayEl.classList.add('selected-day');
        }
    });

    calendar.render();

}


// 지금 시간 비교
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
            const timeText = slot.textContent.trim();
            const cleanedTime = timeText.replace(/[^\d:]/g, '');
            const slotTime = format.timeAsDate(cleanedTime);
            slot.disabled = slotTime < now;
        });
    } else if (isPast){
        timeSlots.forEach(slot => {
            slot.disabled = true;
        });
    } else {
        timeSlots.forEach(slot => slot.disabled = false);
    }
};

// 예약 시간 비교
const getBookings = async function (roomNo, dateStr) {
    const response = await api.getDailyBookings(roomNo, dateStr);

    const bookedTimes = new Set();

    response.forEach(data => {
        const startTime = new Date(`1970-01-01T${data.startsAt.split('T')[1]}`);
        const endTime = new Date(`1970-01-01T${data.finishesAt.split('T')[1]}`);

        const beforeStart = new Date(startTime);
        beforeStart.setMinutes(beforeStart.getMinutes() - 30);

        const beforeStartStr = format.dateExtractTime(beforeStart);
        bookedTimes.add(beforeStartStr);

        let current = new Date(startTime);

        while (current < endTime) {
            const timeStr = format.dateExtractTime(current);
            bookedTimes.add(timeStr);

            current.setMinutes(current.getMinutes() + 30);
        }
    });

    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(slot => {
        const timeText = slot.textContent.trim();
        if (bookedTimes.has(timeText)) {
            slot.disabled = true;
        }
    });
}

// 시간 버튼
const selectTime = function (button) {
    const timeSlots = document.querySelectorAll('.time-slot');
    timeSlots.forEach(btn => {
        btn.classList.remove('selected-time-slot');
    });

    button.classList.add('selected-time-slot');
    selectedTime = button.textContent;
};

// 알림창
function getAlert(){
    const reserveBtn = document.getElementById("reserveBtn");

    reserveBtn.addEventListener('click', () => {
        let attendees = document.getElementById("attendees").value;

        if(selectedDate && selectedTime && attendees && selectedRoom){
            Swal.fire({
                title: "예약 사용 설명",
                icon: "info",
                html: `
                    <p> 
                        예약 연장: 최초 1회 가능 <br/>
                        1회 연장 가능 시간: 30분<br/>
                        <b>‘예약 코드'</b>를 입력해야 입실 가능합니다.<br/>
                        퇴실 시 <b>‘회의 종료'</b> 클릭 후 퇴실<br/>
                        예약 시작 10분 이내 미입장시 자동 취소<br/>
                        <br/><br/>
                        회의실 사용 설명을 숙지하였고,<br/>
                        위 내용에 동의합니다. <br/>
                    </p>`,
                showCancelButton: true,
                confirmButtonText: '예약 확정하기',
                confirmButtonColor: '#4a90e2',
                cancelButtonText: '돌아가기',
                preConfirm: async () => {

                    const data = {
                        // todo 수정
                        roomNo: selectedRoom,
                        date: selectedDate,
                        time: format.to24Hour(selectedTime),
                        attendeeCount: Number(attendees)
                    }

                    try{
                        let response;
                        if(id) {
                            response = await api.updateBooking(id, data);
                        } else {
                            response = await api.registerBooking(data);
                        }
                        window.location.href = `/booking/success?id=${response.no}`
                    } catch (error) {
                        Swal.showValidationMessage(`${error.message}`);
                        // sessionStorage.setItem("bookingError", error.message);
                        // window.location.href='/booking/failed';
                    }
                }
            })
        } else {
            let missingFields = [];

            if (!selectedRoom) missingFields.push("회의실");
            if (!selectedDate) missingFields.push("날짜");
            if (!selectedTime) missingFields.push("시간");
            if (!attendees) missingFields.push("인원 수");

            Swal.fire({
                icon: 'warning',
                title: '입력 누락',
                text: `${missingFields.join(', ')}를(을) 입력해주세요.`,
                confirmButtonColor: '#4a90e2',
            });
        }
    })
}