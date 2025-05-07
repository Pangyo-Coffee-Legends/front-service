'use strict';

const api = apiStore();
const format = formatStore();

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page')) || 1;
    await loadBookings(page);
});

async function loadBookings(page = 1) {
    const response = await api.getMemberBooking(page);
    console.log(response);

    getBookings(response.content, response.totalElements, page, response.size);
    renderPagination(response.totalPages, response.number, loadBookings);
}

const getBookings = function (bookings, totalElements, currentPage, size) {
    const container = document.querySelector('.history-container');
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
                <td class="booking-room">${data.roomName}</td>
                <td class="booking-room">${data.attendeeCount}</td>
                <td class="booking-code">${data.code}</td>
                <td class="booking-date">${format.ampm(data.date)}</td>
                <td class="booking-finished">${!data.finishedAt ? '-' : format.ampm(data.finishedAt)}</td>
                <td class="booking-change">${data.changeName == null ? '-' : data.changeName}</td>
                <td>
                  ${data.changeName === '취소' || !isFuture ? '' :
            `<button class="edit-btn" onclick="window.location.href='/booking/update?id=${data.no}'">수정</button>
                     <button class="cancel-btn" data-value="${data.no}" onclick="cancelAlert(this)">취소</button>`
        }
                </td>
            </tr>
        `;
    });
};

function renderPagination(totalPages, currentPage, onPageChange) {
    const paginationEl = document.getElementById('pagination');
    paginationEl.innerHTML = '';

    const createButton = (text, page, disabled = false, active = false) => {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.disabled = disabled;
        btn.className = `page-btn ${active ? 'active' : ''}`;
        btn.addEventListener('click', () => window.location.search=`page=${page + 1}`);
        return btn;
    };

    paginationEl.appendChild(createButton('이전', currentPage - 1, currentPage === 0));

    for (let i = 0; i < totalPages; i++) {
        paginationEl.appendChild(createButton(i + 1, i, false, i === currentPage));
    }

    paginationEl.appendChild(createButton('다음', currentPage + 1, currentPage === totalPages - 1));
}

const cancelAlert = function(button){
    Swal.fire({
        title: "정말 예약을 취소하시겠습니까?",
        text: "취소하면 다시 복구할 수 없습니다.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "네",
        cancelButtonText: "아니요",
        confirmButtonColor: '#3085d6',
    }).then((confirmResult) => {
        if (confirmResult.isConfirmed) {
            Swal.fire({
                title: "본인 인증이 필요합니다.",
                text: "비밀번호를 입력해주세요.",
                icon: "question",
                input: "password",
                inputAttributes: {
                    autocapitalize: "off"
                },
                showCancelButton: true,
                confirmButtonText: "확인",
                cancelButtonText: "취소",
                confirmButtonColor: '#4a90e2',
                showLoaderOnConfirm: true,
                preConfirm: async (password) => {
                    try {
                        const data = {
                            password: password
                        }

                        // console.log('success', await api.verifyPassword(data))

                        return await api.verifyPassword(data);
                    } catch (error) {
                        Swal.showValidationMessage(` 요청 실패: ${error}`);
                    }
                },
                allowOutsideClick: () => !Swal.isLoading()
            }).then(async (passwordResult) => {
                if (passwordResult.isConfirmed) {
                    await api.cancelBooking(button.dataset.value);

                    Swal.fire({
                        title: "예약이 성공적으로 취소되었습니다.",
                        icon: "success",
                        confirmButtonColor: '#4a90e2',
                    });

                    window.location.reload();
                }
            });
        }
    });

}