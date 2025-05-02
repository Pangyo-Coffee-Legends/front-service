'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const message = document.querySelector(".failure-message");
    message.innerText = sessionStorage.getItem("bookingError");
});


