'use strict';

import { renderPagination } from '../utils/pagination.js';
import { cancelAlert } from '../utils/alert.js';

const api = apiStore();
const format = formatStore();
const paginationEl = document.getElementById('pagination');

let controls;

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page')) || 1;

    ['sortField','sortDirection','pageSize'].forEach(key => {
        const el = document.getElementById(key === 'pageSize' ? 'pageSizeSelect' : key);
        if (params.has(key) && el) el.value = params.get(key);
    });

    controls = {
        sortField: document.getElementById("sortField"),
        sortDirection: document.getElementById("sortDirection"),
        pageSize: document.getElementById("pageSizeSelect"),
    };

    Object.values(controls).forEach(el => el.addEventListener('change', () => loadBookings(1)));

    await loadBookings(page);
});

async function loadBookings(page = 1) {
    showLoadingCard();

    const sf = controls.sortField.value;
    const sd = controls.sortDirection.value;
    const ps = controls.pageSize.value;

    const params = new URLSearchParams({ page, sortField: sf, sortDirection: sd, pageSize: ps });
    window.history.replaceState({}, '', `?${params.toString()}`);

    const response = await api.getAllBookings(sf, sd, ps, page);
    getBookings(response.content, response.totalElements, page, response.size);
    renderPagination(paginationEl, response.totalPages, response.number, loadBookings);

    hideLoadingCard();
}

function showLoadingCard() {
    const card = document.getElementById("loadingCard");
    if (card) card.style.display = "flex";
}

function hideLoadingCard() {
    const card = document.getElementById("loadingCard");
    if (card) card.style.display = "none";
}

const getBookings = function (bookings, totalElements, currentPage, size) {
    const container = document.querySelector('.booking-admin-container');
    container.innerHTML = '';

    bookings.forEach((data, idx) => {
        const index = totalElements - ((currentPage - 1) * size + idx);
        const bookingTime = new Date(data.startsAt);
        const now = new Date();
        const isFuture = bookingTime > now;

        container.innerHTML += `
            <tr>
                <td class="booking-no">${index}</td>
                <td class="booking-member">${data.member.name}</td>
                <td class="booking-email">${data.member.email}</td>
                <td class="booking-room">${data.room.name}</td>
                <td class="booking-room">${data.attendeeCount}</td>
                <td class="booking-code">${data.changeName === '취소' ? '-' : data.code}</td>
                <td class="booking-date">${format.dateTime(data.startsAt)}</td>
                <td class="booking-finished">${!data.finishesAt ? '-' : format.dateTime(data.finishesAt)}</td>
                <td class="booking-change">${data.changeName == null ? '-' : data.changeName}</td>
                <td>
                  ${data.changeName === '취소' || data.changeName === '종료' || !isFuture ? '' :
            `<button class="cancel-btn" data-value="${data.no}">취소</button>`
        }
                </td>
                <td class="booking-date">${format.ampm(data.createdAt)}</td>
            </tr>
        `;
    });
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-danger')) {
            cancelAlert(e.target);
        }
    });
};