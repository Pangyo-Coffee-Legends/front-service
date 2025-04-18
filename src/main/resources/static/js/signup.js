document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const signupError = document.getElementById("signupError");

    // 회원가입 완료
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("signupEmail").value.trim();
        const name = document.getElementById("signupName").value.trim();
        const password = document.getElementById("signupPassword").value;
        const passwordConfirm = document.getElementById("signupPasswordConfirm").value;
        const phone = document.getElementById("signupPhone").value.trim();

        if (!email || !name || !password || !phone) {
            signupError.textContent = "모든 항목을 입력해주세요.";
            return;
        }

        const headers = {
            method: "POST",
            body: {
                role: "ROLE_USER",
                name: name,
                password: password,
                passwordConfirm: passwordConfirm,
                phoneNumber: phone
            }
        }
        const data = await fetch("http://localhost:8080/api/v1/members", headers)
            .then(response => response.json())

        console.log(data)

        alert("회원가입 완료! 로그인 해주세요.");
        window.location.href = "/";

    });

});

