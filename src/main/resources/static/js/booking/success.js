'use strict';

const api = apiStore();
const format = formatStore();

document.addEventListener('DOMContentLoaded', async () => {
    if(sessionStorage.getItem("bookingError")){
        sessionStorage.removeItem("bookingError")
    }

    const id = window.location.search.split("=")[1];

    const data = await api.getBooking(id);

    const code = document.querySelector(".code");
    code.innerText = data.code;

    const date = document.querySelector(".date");
    date.innerText = format.ampm(data.startsAt);
    const finished = document.querySelector(".finished-at");
    finished.innerText = format.ampm(data.finishesAt);
    const room = document.querySelector(".room");
    room.innerText = data.room.name;
    const attendees = document.querySelector(".attendees");
    attendees.innerText = data.attendeeCount;
    const member = document.querySelector(".member-name");
    member.innerText = data.member.name;

});


