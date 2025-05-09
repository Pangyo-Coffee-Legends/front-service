'use strict';

const api = apiStore();
const format = formatStore();

document.addEventListener('DOMContentLoaded', async () => {
    if(sessionStorage.getItem("bookingError")){
        sessionStorage.removeItem("bookingError")
    }

    const id = window.location.search.split("=")[1];
    const GET_OPTIONS = {
        method:'GET',
        credentials: 'include',
        headers: {
            accepts: 'application/json',
        }
    }

    const response = await fetch(`http://localhost:10251/api/v1/bookings/${id}`, GET_OPTIONS);
    if(!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '요청 실패');
    };

    const data = await response.json();
    const code = document.querySelector(".code");
    code.innerText = data.code;

    const date = document.querySelector(".date");
    date.innerText = format.ampm(data.date);
    const finished = document.querySelector(".finished-at");
    finished.innerText = format.ampm(data.finishedAt);
    const room = document.querySelector(".room");
    room.innerText = data.roomName;
    const attendees = document.querySelector(".attendees");
    attendees.innerText = data.attendeeCount;
    const member = document.querySelector(".member-name");
    member.innerText = data.mbName;

});


