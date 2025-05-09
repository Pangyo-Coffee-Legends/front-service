'use strict';

import { renderPagination } from './utils/pagination.js';
import { cancelAlert } from './utils/alert.js';

const api = apiStore();
const format = formatStore();
const paginationEl = document.getElementById('pagination');

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page')) || 1;
    await loadBookings(page);
});

async function loadBookings(page = 1) {
    const response = await api.getAllBookings(page);
    console.log(response);

    getBookings(response.content, response.totalElements, page, response.size);
    renderPagination(paginationEl, response.totalPages, response.number, loadBookings);
}

const getBookings = function (bookings, totalElements, currentPage, size) {
    const container = document.querySelector('.booking-admin-container');
    container.innerHTML = '';

    bookings.forEach((data, idx) => {
        const index = totalElements - ((currentPage - 1) * size + idx);
        const bookingTime = new Date(data.date);
        const now = new Date();
        const isFuture = bookingTime > now;

        container.innerHTML += `
            <tr>
                <td class="booking-no">${index}</td>
                <td class="booking-member">${data.mbName}</td>
                <td class="booking-email">${data.email}</td>
<!--                <td class="booking-phone">${data.phoneNumber}</td>-->
                <td class="booking-room">${data.roomName}</td>
                <td class="booking-room">${data.attendeeCount}</td>
                <td class="booking-code">${data.changeName === '취소' ? '-' : data.code}</td>
                <td class="booking-date">${format.ampm(data.date)}</td>
                <td class="booking-finished">${!data.finishedAt ? '-' : format.ampm(data.finishedAt)}</td>
                <td class="booking-change">${data.changeName == null ? '-' : data.changeName}</td>
                <td>
                  ${data.changeName === '취소' || !isFuture ? '' :
                    `<button class="cancel-btn" data-value="${data.no}">취소</button>`
        }
                </td>
                <td class="booking-date">${format.ampm(data.createdAt)}</td>
            </tr>
        `;
    });
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('cancel-btn')) {
            cancelAlert(e.target);
        }
    });
};