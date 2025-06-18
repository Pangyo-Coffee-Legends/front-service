const STOMP_SUBSCRIBE_TOPIC = '/notification'; // 서버가 메시지를 발행하는 토픽 (예시)

// DOM 요소 가져오기
const chatBox = document.getElementById('chat-box-simple');

// STOMP 클라이언트 객체
let stompClient = null;
let username = null;
// let username = "User" + Math.floor(Math.random() * 1000); // 간단한 임시 사용자 이름

/**
 * SockJS 및 STOMP 연결 함수
 */
function connect() {
    if (stompClient && stompClient.connected) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const roomName = params.get('roomName');
    if (roomName) {
        document.getElementById('chat-room-title').textContent = roomName;
    }

    getHistoryNotification();

    // 1. SockJS 클라이언트 생성
    stompClient = new SockJS(`${API_BASE_URL}/ws/notification/connect`);

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

    // HTML 형태로 받은 메시지를 innerHTML로 설정
    bubble.innerHTML = message.content;

    // 기본 스타일 적용
    bubble.style.whiteSpace = 'pre-line';
    bubble.style.fontFamily = 'Segoe UI, sans-serif';
    bubble.style.lineHeight = '1.6';

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

// 실제 알림 데이터에서 년도 추출하여 드롭다운 생성
async function initializeYearFilterFromData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/notification/history`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const messages = await response.json();
            const yearSelect = document.getElementById('year-filter');
            const availableYears = new Set();

            // 실제 알림 데이터에서 년도 추출
            messages.forEach(message => {
                if (message.createdAt) {
                    const year = new Date(message.createdAt).getFullYear();
                    availableYears.add(year);
                }
            });

            // 년도를 내림차순으로 정렬 (최신년도가 위에)
            const sortedYears = Array.from(availableYears).sort((a, b) => b - a);

            // 기존 옵션 제거 (전체 옵션 제외)
            while (yearSelect.children.length > 1) {
                yearSelect.removeChild(yearSelect.lastChild);
            }

            // 실제 데이터가 있는 년도만 추가
            sortedYears.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year + '년';
                yearSelect.appendChild(option);
            });

        } else {
            console.error("알림 데이터를 가져오는데 실패했습니다.");
            // 실패시 기본 년도 범위 사용
            initializeDefaultYearFilter();
        }
    } catch (error) {
        console.error("년도 필터 초기화 오류:", error);
        // 에러시 기본 년도 범위 사용
        initializeDefaultYearFilter();
    }
}

// 기본 년도 필터 (백업용)
function initializeDefaultYearFilter() {
    const yearSelect = document.getElementById('year-filter');
    const currentYear = new Date().getFullYear();

    // 현재 년도부터 과거 5년까지만
    for (let i = 0; i <= 5; i++) {
        const option = document.createElement('option');
        const year = currentYear - i;
        option.value = year;
        option.textContent = year + '년';
        yearSelect.appendChild(option);
    }
}

// 일 드롭다운 초기화
function initializeDayFilter() {
    const daySelect = document.getElementById('day-filter');

    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i + '일';
        daySelect.appendChild(option);
    }
}

// 선택된 년/월에 따라 일 옵션 업데이트
function updateDayOptions() {
    const yearSelect = document.getElementById('year-filter');
    const monthSelect = document.getElementById('month-filter');
    const daySelect = document.getElementById('day-filter');

    const selectedYear = yearSelect.value;
    const selectedMonth = monthSelect.value;

    if (selectedYear && selectedMonth) {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

        // 기존 일 옵션 제거 (전체 옵션 제외)
        while (daySelect.children.length > 1) {
            daySelect.removeChild(daySelect.lastChild);
        }

        // 해당 월의 일수만큼 옵션 추가
        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i + '일';
            daySelect.appendChild(option);
        }
    }
}

// 필터링된 알림 내역 조회
async function getFilteredNotificationHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/notification/history`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const messages = await response.json();

            const yearFilter = document.getElementById('year-filter').value;
            const monthFilter = document.getElementById('month-filter').value;
            const dayFilter = document.getElementById('day-filter').value;

            for (const message of messages) {
                const messageDate = new Date(message.createdAt);
                const messageYear = messageDate.getFullYear().toString();
                const messageMonth = (messageDate.getMonth() + 1).toString();
                const messageDay = messageDate.getDate().toString();

                // 필터 조건 확인
                let shouldDisplay = true;

                if (yearFilter && messageYear !== yearFilter) {
                    shouldDisplay = false;
                }
                if (monthFilter && messageMonth !== monthFilter) {
                    shouldDisplay = false;
                }
                if (dayFilter && messageDay !== dayFilter) {
                    shouldDisplay = false;
                }

                if (shouldDisplay) {
                    displayMessage(message);
                }
            }
        } else {
            displaySystemMessage("메시지를 가져오는 데 실패했습니다.");
        }
    } catch (error) {
        console.error("메시지 로드 오류:", error);
        displaySystemMessage("메시지를 가져오는 데 실패했습니다.");
    }
}

// 기존 getHistoryNotification 함수를 getFilteredNotificationHistory로 대체
async function getHistoryNotification() {
    await getFilteredNotificationHistory();
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

    // HTML 형태로 받은 메시지를 innerHTML로 설정
    bubble.innerHTML = msgText;

    // 기본 스타일 적용
    bubble.style.whiteSpace = 'pre-line';
    bubble.style.fontFamily = 'Segoe UI, sans-serif';
    bubble.style.lineHeight = '1.6';

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
        stompClient.disconnect(() => {
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
// document.addEventListener('DOMContentLoaded', connect); // 페이지 로드 시 연결 시도

// 이벤트 리스너 수정
document.addEventListener('DOMContentLoaded', () => {
    initializeYearFilterFromData(); // 실제 데이터 기반 년도 초기화
    initializeDayFilter();
    connect();
});

// 필터 변경 이벤트 리스너
document.getElementById('year-filter').addEventListener('change', () => {
    updateDayOptions();
    chatBox.innerHTML = '';
    getFilteredNotificationHistory();
});

document.getElementById('month-filter').addEventListener('change', () => {
    updateDayOptions();
    chatBox.innerHTML = '';
    getFilteredNotificationHistory();
});

document.getElementById('day-filter').addEventListener('change', () => {
    chatBox.innerHTML = '';
    getFilteredNotificationHistory();
});

window.addEventListener('beforeunload', disconnect); // 페이지 이탈 전 연결 해제