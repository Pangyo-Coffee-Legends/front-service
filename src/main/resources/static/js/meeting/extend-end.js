'use strict';

const api = apiStore();


document.querySelector('.extend-btn').addEventListener('click',  async function () {
    // 연장 처리 로직 호출
    await api.extendBooking();
});

document.querySelector('.end-btn').addEventListener('click', async function() {
    // 종료 처리 로직 호출
});