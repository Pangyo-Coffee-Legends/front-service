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

        console.log(email);
        console.log(name);
        console.log(password);
        console.log(confirmPassword);
        console.log(phone);

        if (password !== confirmPassword) {
            console.log("비밀번호가 일치하지 않습니다.");
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

            const json = await fetch("http://localhost:10251/api/v1/members", options)
                .then(response => response.json()).catch(e => console.log(e));

            console.log(json);

            alert("회원가입 완료! 로그인 해주세요.");

            window.location.href = "/";
        }

    });

});

