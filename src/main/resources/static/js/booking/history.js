'use strict';

const api = apiStore();
const format = formatStore();

document.addEventListener('DOMContentLoaded', async () => {
    await getBookings();
});

const getBookings = async function () {
    const container = document.querySelector('.history-container');
    const response = await api.getMemberBooking();

    response.content.forEach(data => {
        container.innerHTML += `
                <tr>
                    <td class="booking-no">${data.no}</td>
                    <td class="booking-member">${data.mbName}</td>
                    <td class="booking-room">${data.roomName}</td>
                    <td class="booking-code">${data.code}</td>
                    <td class="booking-date">${format.ampm(data.date)}</td>
                    <td class="booking-finished">${!data.finishedAt ? '-' : format.ampm(data.finishedAt)}</td>
                    <td class="booking-change">${data.changeName == null ? '-' : data.changeName}</td>
                    <td>
                       ${data.changeName === '취소' ? '' :
                        `<button class="edit-btn" onclick="window.location.href='/booking/update?id=${data.no}'">수정</button>
                         <button class="cancel-btn" data-value="${data.no}" onclick="cancelAlert(this)">취소</button>`
                        }
                    </td>
                </tr>
        `;
    })


    // console.log(response);
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