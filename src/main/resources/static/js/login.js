document.addEventListener("DOMContentLoaded", () => {

    // 일단 구현 안함 => 이거 쓰자(아직 Oauth 구현 X)
    // 소셜 로그인 버튼 테스트
    document.querySelector(".google").addEventListener("click", () => {
        window.location.href="/oauth2/authorization/google";
    });

    // document.querySelector(".github").addEventListener("click", () => {
    //     window.location.href="/oauth2/authorization/github";
    // });

});

