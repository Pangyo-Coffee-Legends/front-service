'use strict';

import { renderPagination } from '../utils/pagination.js';
import { cancelAlert } from '../utils/alert.js';

const api = apiStore();
const format = formatStore();
const paginationEl = document.getElementById('pagination');

// 🔁 전역 controls 선언
let controls;

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page')) || 1;

    // URL 파라미터 값으로 초기화
    ['sortField', 'sortDirection', 'pageSize'].forEach(key => {
        const el = document.getElementById(key === 'pageSize' ? 'pageSizeSelect' : key);
        if (params.has(key) && el) el.value = params.get(key);
    });

    // 전역 controls 할당
    controls = {
        sortField: document.getElementById("sortField"),
        sortDirection: document.getElementById("sortDirection"),
        pageSize: document.getElementById("pageSizeSelect"),
    };

    Object.values(controls).forEach(el =>
        el.addEventListener("change", () => loadBookings(1))
    );

    await loadBookings(page);
});

async function loadBookings(page = 1) {
    const sortField = controls.sortField.value;
    const sortDirection = controls.sortDirection.value;
    const pageSize = controls.pageSize.value;

    // 현재 옵션을 URL에 반영
    const params = new URLSearchParams({
        page,
        sortField,
        sortDirection,
        pageSize
    });
    window.history.replaceState({}, '', `?${params.toString()}`);

    const response = await api.getMemberBookings(sortField, sortDirection, pageSize, page);

    getBookings(response.content, response.totalElements, page, response.size);

    // 콜백에서 현재 controls를 사용하게 유지
    renderPagination(paginationEl, response.totalPages, response.number, loadBookings);
}

const getBookings = function (bookings, totalElements, currentPage, size) {
    const container = document.querySelector('.history-container');
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
                <td class="booking-room">${data.room.name}</td>
                <td class="booking-room">${data.attendeeCount}</td>
                <td class="booking-code">${data.changeName === '취소' ? '-' : data.code}</td>
                <td class="booking-date">${format.ampm(data.startsAt)}</td>
                <td class="booking-finished">${!data.finishesAt ? '-' : format.ampm(data.finishesAt)}</td>
                <td class="booking-change">${data.changeName == null ? '-' : data.changeName}</td>
                <td>
                  ${data.changeName === '취소' || data.changeName === '종료' || !isFuture ? '' :
            `<button class="edit-btn" onclick="window.location.href='/booking/update?id=${data.no}'">수정</button>
                     <button class="cancel-btn" data-value="${data.no}">취소</button>`
        }
                </td>
            </tr>
        `;
    });

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('cancel-btn')) {
            cancelAlert(e.target);
        }
    });
};
