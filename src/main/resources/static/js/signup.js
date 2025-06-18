document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");

    // 회원가입 완료
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("signupEmail").value.trim();
        const name = document.getElementById("signupName").value.trim();
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("signupPasswordConfirm").value;
        const phone = document.getElementById("signupPhone").value.trim();

        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
        } else {
            const data = {
                roleName: "ROLE_USER",
                name: name,
                email: email,
                password: password,
                confirmPassword: confirmPassword,
                phoneNumber: phone
            }

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }

            const response = await fetch("https://aiot2.live/api/v1/members", options);

            if (!response.ok) {
                const error = await response.json();
                alert(`회원가입 실패!\n${error.message}`)
                throw new Error(error.message || '회원가입에 실패했습니다.');
            }

            alert("회원가입 완료! 로그인 해주세요.");

            window.location.href = "/";
        }

    });

});

