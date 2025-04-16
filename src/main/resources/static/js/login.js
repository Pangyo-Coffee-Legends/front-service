document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginBox = document.getElementById("loginBox");
    const logoutSection = document.getElementById("logoutSection");
    const logoutBtn = document.getElementById("logoutBtn");
    const userEmailText = document.getElementById("userEmail");

    const loginError = document.getElementById("loginError");

    // 로그인
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        // TODO fetch
        const email = document.getElementById("username").value.trim();
        // const password = document.getElementById("password").value;
        // const users = JSON.parse(localStorage.getItem("users")) || {};

        loginError.textContent = "";

        // if (!users[email]) {
        //     loginError.textContent = "존재하지 않는 이메일입니다.";
        //     return;
        // }
        //
        // const hashed = await hashPassword(password);
        // if (users[email].password !== hashed) {
        //     loginError.textContent = "비밀번호가 틀렸습니다.";
        //     return;
        // }

        // localStorage.setItem("loggedInUser", email);
        window.location.href = "/index.html";
    });

    // // 로그아웃
    // if (logoutBtn) {
    //     logoutBtn.addEventListener("click", () => {
    //         loginForm.reset();
    //         loginBox.style.display = "block";
    //         logoutSection.style.display = "none";
    //         userEmailText.textContent = "";
    //         localStorage.removeItem("loggedInUser");
    //     });
    // }

    // 일단 구현 안함 => 이거 쓰자(아직 Oauth 구현 X)
    // 소셜 로그인 버튼 테스트
    document.querySelector(".google").addEventListener("click", () => {
        alert("구글 로그인은 아직 구현되지 않았습니다.");
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

