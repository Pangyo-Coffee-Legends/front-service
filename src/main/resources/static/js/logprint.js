const logViewer = document.getElementById('log-viewer');
const socket = new WebSocket("ws://localhost:10253/ws/logs");

socket.onopen = function () {
    console.log("웹소켓 연결 성공");
};

socket.onmessage = function (event) {
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