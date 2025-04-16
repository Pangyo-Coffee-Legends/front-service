document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const signupError = document.getElementById("signupError");

    // 유틸: SHA-256 해시
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }

    // 회원가입 완료
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("signupEmail").value.trim();
        const name = document.getElementById("signupName").value.trim();
        const password = document.getElementById("signupPassword").value;
        const phone = document.getElementById("signupPhone").value.trim();

        if (!email || !name || !password || !phone) {
            signupError.textContent = "모든 항목을 입력해주세요.";
            return;
        }

        // const users = JSON.parse(localStorage.getItem("users")) || {};
        // if (users[email]) {
        //     signupError.textContent = "이미 가입된 이메일입니다.";
        //     return;
        // }

        // const hashed = await hashPassword(password);
        // users[email] = { name, password: hashed, phone };
        // localStorage.setItem("users", JSON.stringify(users));

        alert("회원가입 완료! 로그인 해주세요.");
        window.location.href = "/";

    });

});

