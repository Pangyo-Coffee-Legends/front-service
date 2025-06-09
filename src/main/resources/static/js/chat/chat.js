// const API_BASE_URL = 'https://aiot2.live';

// SockJS 및 STOMP 서버 엔드포인트 (실제 환경에 맞게 수정 필요)
// 주의: SockJS 엔드포인트는 http:// 또는 https:// 프로토콜을 사용합니다.
// Spring Boot에서 STOMP를 설정했다면, 보통 WebSocketConfigurer에서 등록한 엔드포인트입니다.
// const SOCKJS_ENDPOINT = `${API_BASE_URL}/ws/chat/connect`; // 예: '/ws-stomp' 또는 서버에서 설정한 엔드포인트
const CHAT_ROOM_LIST_NON_MEMBER_API_URL = `${API_BASE_URL}/api/v1/chat/room/${roomId}/nonmember/list`;
const HISTORY_CHAT_ROOM_API_URL = `${API_BASE_URL}/api/v1/chat/history/${roomId}`;
const inviteMultipleURL = `${API_BASE_URL}/api/v1/chat/room/group/invite-multiple/${roomId}/join`;
const EXIT_CHAT_ROOM_API_URL = `${API_BASE_URL}/api/v1/chat/room`;
const READ_CHAT_ROOM_API_URL = `${API_BASE_URL}/api/v1/chat/room/${roomId}/read`;

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
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const roomName = params.get('roomName');
    if (roomName) {
        document.getElementById('chat-room-title').textContent = roomName;
    }

    markMessagesAsRead();
    getHistoryMessages();

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
        'roomId': roomId
    }, onConnected, onError);

    username = userEmail;
}

/**
 * STOMP 연결 성공 시 콜백 함수
 */
function onConnected() {
    displaySystemMessage("서버에 연결되었습니다.");

    // 현재 활성화된 채팅방 ID를 localStorage에 저장
    localStorage.setItem('activeChatRoomId', roomId);

    // 사이드바가 즉시 반응하도록 커스텀 이벤트 발생 (선택 사항)
    const roomEnteredEvent = new CustomEvent('roomActive', { detail: { roomId: roomId } });
    window.dispatchEvent(roomEnteredEvent);

    // 4. 특정 토픽 구독 시작
    // stompClient.subscribe(destination, callback, headers);
    // 파라미터	    타입	    필수	설명
    // destination	String	    ✅	구독할 STOMP 토픽 경로 (예: /topic/room1)
    // callback	    Function	✅	메시지를 수신했을 때 실행될 함수
    // headers	    Object	    ❌	구독 요청 시 함께 보낼 헤더 (ex. 인증, 세션 등)
    stompClient.subscribe(`${STOMP_SUBSCRIBE_TOPIC}/${roomId}`, onMessageReceived);

    // 2. unreadCountMap 수신 및 갱신 로직 (새로 추가)
    stompClient.subscribe(`${STOMP_SUBSCRIBE_TOPIC}/${roomId}/unread`, (payload) => {
        const unreadCountMap = JSON.parse(payload.body); // { messageId: unreadCount, ... }
        updateUnreadCounts(unreadCountMap);
    });

    // stompClient.send(destination, headers, body);
    // 파라미터	    타입	필수	설명
    // destination	String	✅	    서버에 메시지를 보낼 목적지 (예: /app/chat)
    // headers	    Object	❌	    STOMP 전송 시 함께 보낼 헤더 (예: Authorization, 커스텀 헤더 등)
    // body	        String	❌	    전송할 메시지 내용 (일반적으로 JSON 문자열)
    // 연결 후 채팅 서버에 사용자 접속 알림 메시지 전송 (선택 사항)
    stompClient.send(`${STOMP_SEND_DESTINATION}/${roomId}`, // 실제 서버의 @MessageMapping 경로에 맞춰야 함
        {}, // 헤더 (필요시)
        // JSON.stringify({ sender: username, type: 'JOIN' }) // 메시지 본문 (서버가 받을 형식)
        JSON.stringify({ sender: username}) // 메시지 본문 (서버가 받을 형식)
    );
}

/**
 * STOMP 연결 오류 시 콜백 함수
 */
function onError(error) {
    displaySystemMessage("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
    // 필요 시 재연결 로직 추가 가능
}

/**
 * 구독한 토픽에서 메시지 수신 시 콜백 함수
 * @param {object} payload - STOMP 메시지 프레임 (payload.body에 실제 메시지 내용이 있음)
 */
async function onMessageReceived(payload) {
    if(payload.body.userEmail === username){
    }

    try {
        const message = JSON.parse(payload.body); // 서버가 JSON 문자열로 보낸다고 가정

        displayMessage(message);

        // 접속해있는 방의 메시지 읽음 처리
        await fetch(READ_CHAT_ROOM_API_URL, {
            method: 'POST', // 또는 백엔드가 요구하는 메소드 (GET, POST 등)
            credentials: 'include' // 인증 쿠키 전송
        })

    } catch (e) {
        displayRawMessage(payload.body); // 파싱 실패 시 원본 텍스트 표시
    }
}

/**
 * 메시지 전송 함수
 */
function sendMessage() {
    const messageContent = messageInput.value.trim();

    if (messageContent && stompClient && stompClient.connected) {

        const chatMessage = {
            sender: username,
            content: messageContent,
            // type: 'CHAT' // 메시지 타입 (서버와 약속된 형식)
        };

        try {
            // 5. 특정 목적지로 메시지 전송
            // stompClient.send(destination, headers, body);
            stompClient.send(`${STOMP_SEND_DESTINATION}/${roomId}`, {}, JSON.stringify(chatMessage));
            messageInput.value = ''; // 입력 필드 초기화
        } catch (error) {
            displaySystemMessage("메시지 전송에 실패했습니다.");
        }
    } else if (!messageContent) {
        // 빈 메시지
    } else {
        displaySystemMessage("서버에 연결되지 않았습니다.");
    }
    messageInput.focus();
}

/**
 * 받은 메시지(JSON 객체)를 화면에 표시하는 함수
 * @param {object} message - 서버로부터 받은 메시지 객체 (예: {sender: 'user1', content: 'hello', type: 'CHAT'})
 */
function displayMessage(message) {
    if (message.createdAt == null) {
        message.createdAt = new Date();
    }

    // else if (message.type === 'CHAT') {
    if (message.sender === username) { // 자신이 보낸 메시지는 이미 sendMessage에서 처리
        displayOwnMessage(message);
        return; // displayOwnMessage에서 처리하므로 중복 방지
    }

    if(message.sender === 'system') {
        displaySystemMessage(message.content);
        return;
    }

    displayReceivedMessage(message);
}

/**
 * 자신이 보낸 메시지를 화면에 표시하는 함수
 */
function displayOwnMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', 'sent');
    messageElement.dataset.messageId = message.id; // 메시지 ID 저장

    const senderElement = document.createElement('strong');
    senderElement.textContent = escapeHtml(message.sender);

    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.classList.add('bubble-wrapper');

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.textContent = escapeHtml(message.content);

    const bubbleMeta = document.createElement('div');
    bubbleMeta.classList.add('bubble-meta');

    const unreadElement = document.createElement('div');
    unreadElement.classList.add('message-unread'); // CSS 스타일링을 위한 클래스

    if(message.unreadCount === 0) {
        unreadElement.textContent = escapeHtml(undefined);
    } else {
        unreadElement.textContent = escapeHtml(message.unreadCount);
    }

    const timeElement = document.createElement('span'); // span 태그 사용
    timeElement.classList.add('message-time'); // CSS 스타일링을 위한 클래스
    timeElement.textContent = formatTimestamp(message.createdAt); // message 객체에 createdAt이 있다고 가정

    messageElement.appendChild(senderElement);
    messageElement.appendChild(bubbleWrapper);
    bubbleWrapper.appendChild(bubble);
    bubbleWrapper.appendChild(bubbleMeta);
    bubbleMeta.appendChild(unreadElement);
    bubbleMeta.appendChild(timeElement);


    chatBox.appendChild(messageElement);
    scrollToBottom();
}

/**
 * 자신이 받은 메시지를 화면에 표시하는 함수
 */
function displayReceivedMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', 'received');
    messageElement.dataset.messageId = message.id; // 메시지 ID 저장

    const senderElement = document.createElement('strong');
    senderElement.textContent = escapeHtml(message.sender);

    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.classList.add('bubble-wrapper');

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    bubble.textContent = escapeHtml(message.content);

    const bubbleMeta = document.createElement('div');
    bubbleMeta.classList.add('bubble-meta');

    const unreadElement = document.createElement('div');
    unreadElement.classList.add('message-unread'); // CSS 스타일링을 위한 클래스

    if(message.unreadCount === 0) {
        unreadElement.textContent = escapeHtml(undefined);
    } else {
        unreadElement.textContent = escapeHtml(message.unreadCount);
    }

    const timeElement = document.createElement('span'); // span 태그 사용
    timeElement.classList.add('message-time'); // CSS 스타일링을 위한 클래스
    timeElement.textContent = formatTimestamp(message.createdAt); // message 객체에 createdAt이 있다고 가정

    messageElement.appendChild(senderElement);
    messageElement.appendChild(bubbleWrapper);
    bubbleWrapper.appendChild(bubble);
    bubbleWrapper.appendChild(bubbleMeta);

    bubbleMeta.appendChild(unreadElement);
    bubbleMeta.appendChild(timeElement);

    chatBox.appendChild(messageElement);
    scrollToBottom();
}

/*
    채팅방에 저장되어있는 메시지를 가져오는 함수
 */
async function getHistoryMessages() {
    try {
        const response = await fetch(HISTORY_CHAT_ROOM_API_URL, {
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
        displaySystemMessage("메시지를 가져오는 데 실패했습니다.");
    }
}

/**
 * 파싱 실패 시 원본 텍스트 메시지를 화면에 표시
 */
function displayRawMessage(msgText) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', 'received');
    messageElement.textContent = escapeHtml(msgText);
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

async function markMessagesAsRead() {
    const url = `${API_BASE_URL}/api/v1/chat/room/${roomId}/read`;
    try {
        await fetch(url, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error(error);
    }
}

async function openInviteModal() {
    const modal = document.getElementById('memberModal');

    try {
        const response = await fetch(CHAT_ROOM_LIST_NON_MEMBER_API_URL, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) throw new Error('멤버 조회 실패');

        const members = await response.json();
        const memberList = document.getElementById('memberList');
        memberList.innerHTML = '';

        members.forEach(member => {
            const item = document.createElement('div');
            item.style.padding = '8px';
            item.style.borderBottom = '1px solid #eee';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';


            const infoDiv = document.createElement('div');
            infoDiv.textContent = `${member.name} (${member.email})`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = member.email; // 체크박스의 값으로 이메일 저장
            checkbox.style.marginLeft = '10px';

            item.appendChild(infoDiv);
            item.appendChild(checkbox); // 초대 버튼 대신 체크박스 추가
            memberList.appendChild(item);
        });

        const inviteButton = document.getElementById('invite-button');
        inviteButton.addEventListener('click', inviteSelectedMembers);

        modal.showModal();
    } catch (error) {
        console.error('Error:', error);
        alert('멤버 목록을 불러오는데 실패했습니다.');
    }
}

async function inviteSelectedMembers() {
    const memberList = document.getElementById('memberList');
    const checkboxes = memberList.querySelectorAll('input[type="checkbox"]:checked'); // 선택된 체크박스만 가져오기

    const selectedEmails = [];
    checkboxes.forEach(checkbox => {
        selectedEmails.push(checkbox.value);
    });

    if (selectedEmails.length === 0) {
        alert('초대할 멤버를 선택해주세요.');
        return;
    }

    try {
        const response = await fetch(inviteMultipleURL, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ emails: selectedEmails }) // 이메일 목록을 JSON 형태로 전송
        });

        if (response.ok) {
            document.getElementById('memberModal').close();
        } else {
            const errorMsg = await response.text();
            alert(`초대 실패: ${errorMsg}`);
        }
    } catch (error) {
        console.error('초대 에러:', error);
        alert('초대 요청 중 오류가 발생했습니다.');
    }
}

async function inviteMember(inviteEmail) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/v1/chat/room/group/${inviteEmail}/${roomId}/join`,
            {
                method: 'POST',
                credentials: 'include'
            }
        );

        if (response.ok) {
            // alert(`${inviteEmail} 초대 성공!`);
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message');

            messageElement.classList.add('system');
            messageElement.textContent = escapeHtml(inviteEmail) + ' 님을 초대했습니다.';
        } else {
            const errorMsg = await response.text();
            alert(`초대 실패: ${errorMsg}`);
        }
    } catch (error) {
        console.error('초대 에러:', error);
        alert('초대 요청 중 오류가 발생했습니다.');
    }
}

/**
 * '나가기' 버튼 클릭 시 실행될 함수
 * @param {Event} event - 클릭 이벤트
 */
async function handleExitChatRoom() {
    try {
        const url = `${EXIT_CHAT_ROOM_API_URL}/${encodeURIComponent(roomId)}/leave`;
        const response = await fetch(url, {
            method: 'DELETE', // 또는 백엔드가 요구하는 메소드 (GET, POST 등)
            credentials: 'include' // 인증 쿠키 전송
        });

        if(response.ok) {
            // 해당 컨트롤러 api로 이동
            window.location.href = `/chatList`;
        } else {
            alert('채팅방 나가기에 실패했습니다.');
        }
    } catch (error) {
        console.error('채팅방 나가기 중 오류 발생:', error);
        alert('채팅방 나가기 중 오류가 발생했습니다.');
    }
}

function updateUnreadCounts(unreadCountMap) {
    document.querySelectorAll('.chat-message').forEach(msgElem => {
        const messageId = msgElem.dataset.messageId;
        if (messageId && unreadCountMap[messageId] !== undefined) {
            const unreadElem = msgElem.querySelector('.message-unread');
            if (unreadElem) {
                unreadElem.textContent = unreadCountMap[messageId] === 0 ? undefined : unreadCountMap[messageId];
            }
        }
    });
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

sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

window.addEventListener('beforeunload', disconnect); // 페이지 이탈 전 연결 해제