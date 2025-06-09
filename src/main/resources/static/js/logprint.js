const logViewer = document.getElementById('realtime-log');

const socket = new WebSocket("wss://aiot2.live/ws/logs");

const socket = new WebSocket("ws://localhost:10256/ws/logs");

socket.onopen = function () {
    console.log("웹소켓 연결 성공");
};

socket.onmessage = function (event) {
    if (event.data === "ping") return; // ping은 무시

    const logLine = event.data + '\n';
    logViewer.textContent += logLine;
    logViewer.scrollTop = logViewer.scrollHeight;
};

socket.onerror = function (error) {
    console.error("WebSocket 에러 발생:", error);
};

socket.onclose = function () {
    console.warn("WebSocket 연결 종료됨");
};