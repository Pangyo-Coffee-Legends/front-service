const STOMP_SUBSCRIBE_TOPIC = '/topic'; // 서버가 메시지를 발행하는 토픽 (예시)
const STOMP_SEND_DESTINATION = '/publish'; // 클라이언트가 메시지를 보내는 목적지 (예시, 서버의 @MessageMapping 경로에 따름)

// DOM 요소 가져오기
const chatBox = document.getElementById('chat-box-simple');
const messageInput = document.getElementById('message-input-simple');
const sendButton = document.getElementById('send-button-simple');

// STOMP 클라이언트 객체
let stompClient = null;
let username = null;
// let username = "User" + Math.floor(Math.random() * 1000); // 간단한 임시 사용자 이름

/**
 * SockJS 및 STOMP 연결 함수
 */
function connect() {
    if (stompClient && stompClient.connected) {
        console.log("STOMP가 이미 연결되어 있습니다.");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const roomName = params.get('roomName');
    if (roomName) {
        document.getElementById('chat-room-title').textContent = roomName;
    }

    getHistoryNotification();

    // 1. SockJS 클라이언트 생성
    stompClient = new SockJS(SOCKJS_ENDPOINT);

    // 2. SockJS 클라이언트를 통해 STOMP 클라이언트 생성
    stompClient = Stomp.over(stompClient);

    // 3. STOMP 연결 시도
    // 헤더는 필요에 따라 추가 (예: 인증 토큰)
    // stompClient.connect(headers, connectCallback, errorCallback);
    // connectCallback : STOMP 연결 성공 시 호출될 콜백 함수
    // errorCallback : STOMP 연결 오류 시 실행될 콜백 함수
    stompClient.connect({
        'X-USER': userEmail,
        // 'roomId': roomId
    }, onConnected, onError);

    username = userEmail;
}

/**
 * STOMP 연결 성공 시 콜백 함수
 */
function onConnected() {
    console.log("STOMP 연결 성공!");
    displaySystemMessage("서버에 연결되었습니다.");

    // 4. 특정 토픽 구독 시작
    // stompClient.subscribe(destination, callback, headers);
    // 파라미터	    타입	    필수	설명
    // destination	String	    ✅	구독할 STOMP 토픽 경로 (예: /topic/room1)
    // callback	    Function	✅	메시지를 수신했을 때 실행될 함수
    // headers	    Object	    ❌	구독 요청 시 함께 보낼 헤더 (ex. 인증, 세션 등)
    stompClient.subscribe(`${STOMP_SUBSCRIBE_TOPIC}/${userEmail}`, onMessageReceived);
}

/**
 * STOMP 연결 오류 시 콜백 함수
 */
function onError(error) {
    console.error("STOMP 연결 실패:", error);
    displaySystemMessage("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
    // 필요 시 재연결 로직 추가 가능
}

/**
 * 구독한 토픽에서 메시지 수신 시 콜백 함수
 * @param {object} payload - STOMP 메시지 프레임 (payload.body에 실제 메시지 내용이 있음)
 */
// === STOMP 메시지 수신 ===
function onMessageReceived(payload) {
    try {
        // 서버에서 JSON 문자열로 전송한다고 가정
        // const message = JSON.parse(payload.body);
        displayRawMessage(payload.body);
    } catch (e) {
        console.error("수신 메시지 파싱 오류:", e);
        displaySystemMessage(payload.body);
    }
}

/**
 * 알림 메시지를 chat.js와 동일한 스타일로 화면에 표시하는 함수
 * @param {object} message - {content, createdAt}
 */
function displayMessage(message) {
    // 최상위 메시지 div
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', 'received'); // chat.js와 동일

    // 알림은 sender가 없으니 "알림" 표시
    const senderElement = document.createElement('strong');
    senderElement.textContent = '알림';

    // 말풍선 wrapper
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.classList.add('bubble-wrapper');

    // 말풍선 본체
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.innerHTML = escapeHtml(message.content);

    // 말풍선 하단 메타 정보
    const bubbleMeta = document.createElement('div');
    bubbleMeta.classList.add('bubble-meta');

    // 시간
    const timeElement = document.createElement('span');
    timeElement.classList.add('message-time');
    timeElement.textContent = formatTimestamp(message.createdAt);

    // 트리 구조 조립
    messageElement.appendChild(senderElement);
    messageElement.appendChild(bubbleWrapper);
    bubbleWrapper.appendChild(bubble);
    bubbleWrapper.appendChild(bubbleMeta);
    // bubbleMeta.appendChild(unreadElement); // 알림은 생략
    bubbleMeta.appendChild(timeElement);

    chatBox.appendChild(messageElement);
    scrollToBottom();
}

// === 저장된 알림 내역 조회 ===
async function getHistoryNotification() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/notification/history`, {
            method: 'GET', // 또는 백엔드가 요구하는 메소드 (GET, POST 등)
            credentials: 'include' // 인증 쿠키 전송
        });

        if (response.ok) {
            const messages = await response.json();
            for (const message of messages) {
                displayMessage(message);
            }
        } else {
            displaySystemMessage("메시지를 가져오는 데 실패했습니다.");
        }
    } catch (error) {
        console.error("메시지 로드 오류:", error);
        displaySystemMessage("메시지를 가져오는 데 실패했습니다.");
    }
}

/**
 * 텍스트 메시지를 화면에 표시
 */
function displayRawMessage(msgText) {
    // 최상위 메시지 div
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', 'received'); // chat.js와 동일

    // 알림은 sender가 없으니 "알림" 표시
    const senderElement = document.createElement('strong');
    senderElement.textContent = '알림';

    // 말풍선 wrapper
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.classList.add('bubble-wrapper');

    // 말풍선 본체
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.innerHTML = escapeHtml(msgText);

    // 말풍선 하단 메타 정보
    const bubbleMeta = document.createElement('div');
    bubbleMeta.classList.add('bubble-meta');

    // 현재 시간: 2자리 시:2자리 분 (24시간제)
    const now = new Date();
    const hour = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const timeElement = document.createElement('span');
    timeElement.classList.add('message-time');
    timeElement.textContent = `${hour}:${min}`;

    // 트리 구조 조립
    messageElement.appendChild(senderElement);
    messageElement.appendChild(bubbleWrapper);
    bubbleWrapper.appendChild(bubble);
    bubbleWrapper.appendChild(bubbleMeta);
    // bubbleMeta.appendChild(unreadElement); // 알림은 생략
    bubbleMeta.appendChild(timeElement);

    chatBox.appendChild(messageElement);
    scrollToBottom();
}

/**
 * 시스템 메시지를 화면에 표시하는 함수
 */
function displaySystemMessage(text) {
    console.log(text+"system");
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', 'system');
    messageElement.textContent = escapeHtml(text);
    chatBox.appendChild(messageElement);
    scrollToBottom();
}

/**
 * 채팅 박스 스크롤을 맨 아래로 이동
 */
function scrollToBottom() {
    setTimeout(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 0);
}

/**
 * STOMP 연결 해제 함수
 */
function disconnect() {
    if (stompClient && stompClient.connected) {
        // 연결 해제 시 서버에 알림 메시지 전송 (선택 사항)
        stompClient.send(STOMP_SEND_DESTINATION,
            {},
            JSON.stringify({ sender: username})
        );
        stompClient.disconnect(() => {
            console.log("STOMP 연결 해제됨");
            displaySystemMessage("서버와의 연결이 종료되었습니다.");
            stompClient = null;
        });
    }
}

function escapeHtml(unsafe) {
    if (unsafe === null || typeof unsafe === 'undefined') return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// --- 이벤트 리스너 설정 ---
document.addEventListener('DOMContentLoaded', connect); // 페이지 로드 시 연결 시도

window.addEventListener('beforeunload', disconnect); // 페이지 이탈 전 연결 해제