// API 기본 URL (실제 환경에 맞게 수정 필요)
const API_BASE_URL = 'https://aiot2.live'; // 실제 API 서버 주소로 변경해주세요.
const SOCKET_BASE_URL = 'wss://aiot2.live'
const SOCKJS_ENDPOINT = `${SOCKET_BASE_URL}/ws/chat/connect`; // 예: '/ws-stomp' 또는 서버에서 설정한 엔드포인트
const UNREAD_COUNT_TOPIC = '/topic/unread-count-updates'; // 백엔드에서 지정한 사용자 구독 경로

const UNREAD_NOTIFICATION_COUNT_TOPIC = `/notification/unread-notification-count-updates/${userEmail}`; // 백엔드에서 지정한 사용자 구독 경로
const NOTIFICATION_MESSAGE_TOPIC = `/notification/notification-message/${userEmail}`; // 백엔드에서 지정한 사용자 구독 경로

let SIDEBAR_stompClient = null;
let notificationStompClient = null;

function connectSidebarStomp() {
    // 1. SockJS 클라이언트 생성
    SIDEBAR_stompClient = new SockJS(SOCKJS_ENDPOINT);

    // 2. SockJS 클라이언트를 통해 STOMP 클라이언트 생성
    SIDEBAR_stompClient = Stomp.over(SIDEBAR_stompClient);

    SIDEBAR_stompClient.debug = null;

    SIDEBAR_stompClient.connect({}, onSidebarStompConnected, onWsError2); // 헤더는 필요시 추가
}

function connectNotificationStomp() {
    notificationStompClient = new SockJS(`${SOCKET_BASE_URL}/ws/notification/connect`);
    notificationStompClient = Stomp.over(notificationStompClient);
    notificationStompClient.connect({
        'X-USER': userEmail,
    }, onNotificationConnected, onNotificationError);
}

function onSidebarStompConnected() {
    // 채팅 목록 업데이트 신호를 받을 경로 구독
    SIDEBAR_stompClient.subscribe(UNREAD_COUNT_TOPIC, handleUnreadCountUpdate); // 콜백 함수 연결

    fetchInitialUnreadCount();
}

function onWsError2(error) {
    console.error("STOMP 연결 실패:", error);
}

function onNotificationConnected() {
    notificationStompClient.subscribe(UNREAD_NOTIFICATION_COUNT_TOPIC, handleUnreadNotificationCountUpdate); // 콜백 함수 연결
    notificationStompClient.subscribe(NOTIFICATION_MESSAGE_TOPIC, handleAlertNotificationMessage); // 콜백 함수 연결
}

function onNotificationError(error) {
    console.error("STOMP 연결 실패:", error);
}


// ---  STOMP 메시지 수신 시 콜백 함수 ---
function handleUnreadCountUpdate(message) {
    try {
        const payload  = JSON.parse(message.body);

        // **중요: 이 알림이 나(현재 사용자)를 위한 것인지 확인**
        if (payload && payload.userEmail === userEmail) { // 백엔드가 보낸 이메일과 현재 사용자 이메일 비교

            displayUnreadCountBadge(payload.unreadCount); // <<< 목록 새로고침 함수 호출
        } else {
            // console.log("나에게 온 알림이 아님."); // 디버깅용 로그
        }
    } catch (e) {
        console.error("수신 메시지 파싱 오류:", e);
    }
}

// ---  STOMP 메시지 수신 시 콜백 함수 ---
function handleUnreadNotificationCountUpdate(message) {
    console.log("사이드 바 안 읽은 메시지 테스트 :", message);
    try {
        const payload  = message.body;

        displayNotificationUnreadCountBadge(payload); // <<< 목록 새로고침 함수 호출

    } catch (e) {
        console.error("수신 메시지 파싱 오류:", e);
    }
}

// ---  STOMP 알람 메시지 수신 시 콜백 함수 ---
function handleAlertNotificationMessage(message) {
    try {
        const payload  = message.body;

        showToast(payload);
    } catch (e) {
        console.error("수신 메시지 파싱 오류:", e);
    }
}

function showToast(message, duration = 2000) {
    const toast = document.getElementById('custom-toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast.hideTimeout); // 여러번 눌러도 타이머 초기화
    toast.hideTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// --- 3. UI 업데이트 함수 ---
function displayUnreadCountBadge(count) {
    const chatListLink = document.querySelector('ul.nav a[href="/chatList"]');

    if (chatListLink) {
        let badge = chatListLink.querySelector('.unread-badge');

        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'badge bg-danger ms-1 unread-badge'; // Bootstrap 배지 클래스 예시
            chatListLink.appendChild(badge);
        }

        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// --- 4. Notification UI 업데이트 함수 ---
function displayNotificationUnreadCountBadge(count) {
    const chatListLink = document.querySelector('ul.nav a[href="/notification"]');

    if (chatListLink) {
        let notificationBadge = chatListLink.querySelector('.notification-unread-badge');

        if (!notificationBadge) {
            notificationBadge = document.createElement('span');
            notificationBadge.className = 'badge bg-danger ms-1 unread-badge'; // Bootstrap 배지 클래스 예시
            chatListLink.appendChild(notificationBadge);
        }

        if (count > 0) {
            notificationBadge.textContent = count;
            notificationBadge.style.display = 'inline-block';
        } else {
            notificationBadge.style.display = 'none';
        }
    }
}

async function fetchInitialUnreadCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/unread/count`, {
            method: 'GET',
            credentials: 'include'
        });

        const notificationResponse = await fetch(`${API_BASE_URL}/api/v1/notification/unread/count`, {
            method: 'GET',
            credentials: 'include'
        });

        if(response.ok) {
            const data = await response.json();
            displayUnreadCountBadge(data);
        } else {
            displayUnreadCountBadge(0);
        }

        if(notificationResponse.ok) {
            const data = await notificationResponse.json();
            displayNotificationUnreadCountBadge(data);
        } else {
            displayNotificationUnreadCountBadge(0);
        }

    } catch (error) {
        displayUnreadCountBadge(0);
        displayNotificationUnreadCountBadge(0);
    }
}

async function checkRoleAndRenderMenu() {
    try {
        const roleData = await fetchInitialFindRole();
        console.log('Role data:', roleData); // 객체 전체 확인
        if (roleData && roleData.roleName === 'ROLE_ADMIN') { // roleName으로 접근
            document.getElementById('notification-menu').style.display = 'block';
        } else {
            document.getElementById('notification-menu').style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking role:', error);
        document.getElementById('notification-menu').style.display = 'none';
    }
}

async function fetchInitialFindRole() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/notification/find/role`, {
            method: 'GET',
            credentials: 'include'
        });

        if(response.ok) {
            const roleData = await response.json();
            return roleData; // { role: "ROLE_ADMIN" } 형태 가정
        }

        return null;
    } catch (error) {
        return null;
    }
}

// 알림 링크 클릭 핸들러
function setupNotificationLinkHandler() {
    const notificationLink = document.querySelector('a[href="/notification"]');
    if (notificationLink) {
        notificationLink.addEventListener('click', function(e) {
            e.preventDefault();

            // 2. 서버에 읽음 상태 전송
            fetch(`${API_BASE_URL}/api/v1/notification/read`, {
                method: 'GET',
                credentials: 'include'
            });

            // 배지 초기화
            displayNotificationUnreadCountBadge(0);

            // 3. 페이지 이동
            window.location.href = '/notification';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    connectSidebarStomp();
    // notify 테스트
    connectNotificationStomp();
    checkRoleAndRenderMenu();
    setupNotificationLinkHandler();
});