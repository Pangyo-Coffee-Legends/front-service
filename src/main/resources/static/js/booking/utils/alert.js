const api = apiStore();

export { cancelAlert }

function cancelAlert(button){
    const bookingNo = button.dataset.value;
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
                // showLoaderOnConfirm: true,
                preConfirm: async (password) => {
                    try {
                        const result = await api.verifyPassword(bookingNo, password);

                        if (!result || result !== true) {
                            Swal.showValidationMessage("비밀번호가 일치하지 않습니다.");
                            throw new Error();
                        }

                        return true;
                    } catch (error) {
                        if (error.message) {
                            Swal.showValidationMessage(`요청 실패: ${error.message}`);
                        }
                    }
                },
                allowOutsideClick: () => !Swal.isLoading()
            }).then(async (passwordResult) => {
                if (passwordResult.value === true) {
                    await api.cancelBooking(bookingNo);

                    Swal.fire({
                        title: "예약이 성공적으로 취소되었습니다.",
                        icon: "success",
                        confirmButtonColor: '#4a90e2',
                        preConfirm: () => {
                            window.location.reload();
                        }
                    });

                }
            });
        }
    });
}