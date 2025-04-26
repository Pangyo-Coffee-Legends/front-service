'use strict';

// const api = apiStore();
let selectedDate = null;
let selectedTime = null;

document.addEventListener('DOMContentLoaded', () => {

    // 캘린더
    getCalendar();
    infoAlert();
})


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
        selectable: true,
        dateClick: function(info){
            // console.log(info.dateStr); // 클릭한 날짜
            timeButton(info.dateStr);
            // 클릭 배경색
            document.querySelectorAll('.fc-day').forEach(cell => {
                cell.style.backgroundColor = '';
            });
            info.dayEl.style.backgroundColor = '#e6f0ff'; // #bed5fa

        }
    });

    calendar.render();

    function selectRoom(roomName) {
        document.getElementById('selectedRoom').textContent = `회의실 ${roomName} 예약`;
        // 이후 여기에 캘린더 API 연결 또는 예약 정보 로딩 등 추가 가능
    }
}

// 시간 버튼
const timeButton = function (dateStr){
    const timeSlots = document.querySelectorAll('.time-slot');
    const now = new Date();

    const select = dateStr == null ? now.toISOString().split('T')[0] : dateStr;

    selectedDate = select;

    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0); // 이전 자정 기준

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = selected.getTime() === today.getTime();
    const isPast = selected < today;

    // 초기화
    timeSlots.forEach(slot => slot.classList.remove('selected'));


    function getTimeAsDate(timeStr) {
        const base = new Date();
        const [h, m] = timeStr.split(':');

        let hour = parseInt(h, 10);
        let minute = parseInt(m || '0', 10);

        if (timeStr.includes('오후') || hour < 8) {
            hour += 12;
        }

        base.setHours(hour, minute, 0, 0);
        return base;
    }

    if (isToday) {
        timeSlots.forEach(slot => {
            const timeText = slot.textContent.trim();
            const cleanedTime = timeText.replace(/[^\d:]/g, '');
            const slotTime = getTimeAsDate(cleanedTime);

            if (slotTime < now) {
                slot.classList.add('disabled');
            } else {
                slot.classList.remove('disabled');
            }
        });
    } else if (isPast){
        timeSlots.forEach(slot => slot.classList.add('disabled'));
    } else {
        timeSlots.forEach(slot => slot.classList.remove('disabled'));
    }


    const clickableSlots = document.querySelectorAll('.time-slot:not(.disabled)');
    clickableSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            if (slot.classList.contains('disabled')) return;

            clickableSlots.forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            console.log('선택된 시간:', slot.textContent);
            selectedTime = slot.textContent

        });
    });
}


// 알림창
function infoAlert(){
    const reserveBtn = document.getElementById("reserveBtn");

    reserveBtn.addEventListener('click', () => {
        let attendees = document.getElementById("attendees").value;

        console.log('날짜', selectedDate);
        console.log('시간', selectedTime);
        console.log('예약인원', attendees);

        if(selectedDate && selectedTime && attendees){
            Swal.fire({
                title: "예약 사용 설명",
                icon: "info",
                html: `
                    <p> 
                        예약 연장: 최초 1회 가능 <br/>
                        1회 연장 가능 시간: 30분<br/>
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
                preConfirm: () => {

                    const data = {
                        roomNo: 1,
                        date: selectedDate,
                        time: selectedTime,
                        attendeeCount: Number(attendees)
                    }

                    const options = {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            accepts: 'application/json',
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    }
                    return fetch('http://localhost:10251/api/v1/bookings', options)
                        .then(result => result.json())
                        .then(() => window.location.href='/book/success')
                        .catch(e => {
                            console.log(e);
                            // window.location.href='/book/failed';
                        });
                }
            });
        }
    })
}
