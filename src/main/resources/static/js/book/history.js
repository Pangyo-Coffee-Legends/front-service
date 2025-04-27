'use strict';

// const api = apiStore();

document.addEventListener('DOMContentLoaded', () => {
    cancelAlert();
});

function cancelAlert(){
    const cancelBtn = document.querySelector('.cancel-btn');

    cancelBtn.addEventListener('click', () => {
        // 1. 정말 취소할건지 물어보기
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
                            const url = `http://localhost:10251/api/v1/members/password/${password}`;
                            const response = await fetch(url);
                            if (!response.ok) {
                                return Swal.showValidationMessage(`비밀번호가 일치하지 않습니다.`);
                            }
                            return response.json();
                        } catch (error) {
                            Swal.showValidationMessage(` 요청 실패: ${error}`);
                        }
                    },
                    allowOutsideClick: () => !Swal.isLoading()
                }).then((passwordResult) => {
                    if (passwordResult.isConfirmed) {
                        Swal.fire({
                            title: "예약이 성공적으로 취소되었습니다.",
                            icon: "success",
                            confirmButtonColor: '#4a90e2',
                        });

                        // todo 최종적으로 예약 취소 API 호출 (여기에 DELETE 요청 추가)
                        // 여기에 예약 삭제 요청 넣으면 됨
                        // fetch(`http://localhost:10251/bookings/${id}`, { method: 'DELETE' })
                        //   .then(response => response.json())
                        //   .then(data => {
                        //     console.log('삭제 완료', data);
                        //   });
                    }
                });
            }
        });
    });

}