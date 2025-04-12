document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const loginBox = document.getElementById("loginBox");
    const signupBox = document.getElementById("signupBox");
    const logoutSection = document.getElementById("logoutSection");
    const logoutBtn = document.getElementById("logoutBtn");
    const userEmailText = document.getElementById("userEmail");
    const signupBtn = document.getElementById("showSignup");
    const cancelSignup = document.getElementById("cancelSignup");

    const loginError = document.getElementById("loginError");
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

    // 회원가입 폼 열기
    signupBtn.addEventListener("click", () => {
        loginBox.style.display = "none";
        signupBox.style.display = "block";
        signupError.textContent = "";
    });

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

        const users = JSON.parse(localStorage.getItem("users")) || {};
        if (users[email]) {
            signupError.textContent = "이미 가입된 이메일입니다.";
            return;
        }

        const hashed = await hashPassword(password);
        users[email] = { name, password: hashed, phone };
        localStorage.setItem("users", JSON.stringify(users));

        alert("회원가입 완료! 로그인 해주세요.");
        signupBox.style.display = "none";
        loginBox.style.display = "block";
        signupForm.reset();
    });

    // 회원가입 취소
    cancelSignup.addEventListener("click", () => {
        signupBox.style.display = "none";
        loginBox.style.display = "block";
        signupForm.reset();
        signupError.textContent = "";
    });

    // 로그인
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const users = JSON.parse(localStorage.getItem("users")) || {};

        loginError.textContent = "";

        if (!users[email]) {
            loginError.textContent = "존재하지 않는 이메일입니다.";
            return;
        }

        const hashed = await hashPassword(password);
        if (users[email].password !== hashed) {
            loginError.textContent = "비밀번호가 틀렸습니다.";
            return;
        }

        localStorage.setItem("loggedInUser", email);
        window.location.href = "/index.html";
    });

    // 로그아웃
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            loginForm.reset();
            loginBox.style.display = "block";
            logoutSection.style.display = "none";
            userEmailText.textContent = "";
            localStorage.removeItem("loggedInUser");
        });
    }

    // 일단 구현 안함 => 이거 쓰자(아직 Oauth 구현 X)
    // 소셜 로그인 버튼 테스트
    document.querySelector(".google").addEventListener("click", () => {
        window.location.href="/oauth2/authorization/google"

    });
    document.querySelector(".kakao").addEventListener("click", () => {
        alert("카카오 로그인은 아직 구현되지 않았습니다.");
    });
    document.querySelector(".naver").addEventListener("click", () => {
        alert("네이버 로그인은 아직 구현되지 않았습니다.");
    });

    // // 구현 성공하면 => 이거 쓰자 (Oauth 구현 O)
    // 소셜 로그인 버튼 테스트
    // document.querySelector(".google").addEventListener("click", () => {
    //     window.location.href = "http://localhost:8080/auth/google";
    // });
    //
    // document.querySelector(".kakao").addEventListener("click", () => {
    //     window.location.href = "http://localhost:8080/auth/kakao";
    // });
    //
    // document.querySelector(".naver").addEventListener("click", () => {
    //     window.location.href = "http://localhost:8080/auth/naver";
    // });

});

