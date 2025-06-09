document.addEventListener("DOMContentLoaded", function () {

    const socket = new WebSocket("wss://aiot2.live/ws/stranger");

    socket.onmessage = function (event) {
        if (event.data === "ping") return; // ping은 무시

        const message = event.data;
        console.log("📩 WebSocket 수신 메시지:", message);

        // 메시지 내용이 '이상 출입자 발생'일 경우, 무조건 경고창 띄움
        if (message.includes("이상 출입자 발생")) {
            alert("⚠️ 심야 출입 감지\n\n심야 시간에 출입이 감지되었습니다.\n확인 바랍니다.");
        }

    };

    socket.onerror = function (error) {
        console.error("❌ WebSocket 오류:", error);
    };

    socket.onclose = function () {
        console.warn("🔌 WebSocket 연결 종료");
    };
});
