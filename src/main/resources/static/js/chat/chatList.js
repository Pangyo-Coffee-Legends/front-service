
// API 기본 URL (실제 환경에 맞게 수정 필요)
// const API_BASE_URL = 'http://localhost:10251'; // 실제 API 서버 주소로 변경해주세요.
// const SOCKJS_ENDPOINT = `${API_BASE_URL}/ws/chat/connect`; // 예: '/ws-stomp' 또는 서버에서 설정한 엔드포인트
const CHAT_LIST_INVITATION_TOPIC = '/topic/invitations'; // 백엔드에서 지정한 사용자 구독 경로
const CHAT_LIST_UPDATE_TOPIC = '/topic/chat-list-updates'; // 백엔드에서 지정한 사용자 구독 경로

// DOM 요소 가져오기
const chatRoomListBody = document.getElementById('chat-room-list-body');
const btnShowCreateRoomModal = document.getElementById('btn-show-create-room-modal');
const createChatRoomModal = document.getElementById('createChatRoomModal');
const closeCreateRoomModalBtn = document.getElementById('closeCreateRoomModalBtn');
const newRoomNameInput = document.getElementById('newRoomNameInput');
const cancelCreateRoomBtn = document.getElementById('cancelCreateRoomBtn');
const confirmCreateRoomBtn = document.getElementById('confirmCreateRoomBtn');

// 채팅방 목록을 가져올 API URL (원래 코드에서 사용하던 URL)
const CHAT_ROOM_LIST_API_URL = `${API_BASE_URL}/api/v1/chat/room/list`;
const CREATE_CHAT_ROOM_API_URL = `${API_BASE_URL}/api/v1/chat/room/group/create`;
const JOIN_CHAT_ROOM_API_URL = `${API_BASE_URL}/api/v1/chat/room/group`;
const EXIT_CHAT_ROOM_API_URL = `${API_BASE_URL}/api/v1/chat/room`;

// const userEmail = /*[[${userEmail}]]*/ 'default-email@example.com';

let stompClient = null;

function connect() {
    // 1. SockJS 클라이언트 생성
    stompClient = new SockJS(SOCKJS_ENDPOINT);

    // 2. SockJS 클라이언트를 통해 STOMP 클라이언트 생성
    stompClient = Stomp.over(stompClient);


    stompClient.connect({
        'X-USER': userEmail,
    }, onConnected, onError); // 헤더는 필요시 추가
}

function onConnected() {
    // 채팅 목록 업데이트 신호를 받을 경로 구독
    stompClient.subscribe(CHAT_LIST_INVITATION_TOPIC, onInvitationNotificationReceived); // 콜백 함수 연결
    stompClient.subscribe(CHAT_LIST_UPDATE_TOPIC, onChatListUpdateReceived); // 콜백 함수 연결
}

function onError(error) {
    console.error("STOMP 연결 실패:", error);
}

/**
 * 구독한 토픽에서 초대 관련 알림 수신 시 콜백 함수
 */
function onInvitationNotificationReceived(payload) {
    console.log("초대 관련 알림 수신:", payload);
    try {
        const notification = JSON.parse(payload.body);

        // **중요: 이 알림이 나(현재 사용자)를 위한 것인지 확인**
        if (notification &&
            notification.action === 'reloadChatList' &&
            notification.invitedUser === userEmail) { // 백엔드가 보낸 이메일과 현재 사용자 이메일 비교

            console.log("나에게 온 초대 알림 확인. 채팅 목록 새로고침 실행.");
            loadChatRoomList(); // <<< 목록 새로고침 함수 호출
        } else {
            // console.log("나에게 온 알림이 아님."); // 디버깅용 로그
        }
    } catch (e) {
        console.error("수신 메시지 파싱 오류:", e);
    }
}

function onChatListUpdateReceived(payload) {
    const roomList = JSON.parse(payload.body);
    console.log("채팅 목록 수신:", roomList);

    const tbody = document.getElementById('chat-room-list-body');

    roomList.forEach(room => {
        // 각 tr을 roomId 기준으로 찾는다
        const row = [...tbody.rows].find(tr => {
            // const cellRoomId = tr.cells[0]?.textContent?.trim();

            // 수정: tr의 dataset에서 roomId를 추출 (✅ 정답)
            const storedRoomId = tr.dataset.roomId; // 👈 변경
            return storedRoomId === String(room.roomId);
        });

        if (row && room.email === userEmail) {
            // 기존 행이 있으면 해당 td만 업데이트
            row.cells[0].textContent = escapeHtml(room.roomName);
            row.cells[1].textContent = escapeHtml(room.participantCount);
            row.cells[2].textContent = escapeHtml(room.unreadCount);
        }
    });
}


/**
 * 채팅방 목록을 불러와 테이블에 렌더링하는 함수
 */
async function loadChatRoomList() {
    try {
        const response = await fetch(CHAT_ROOM_LIST_API_URL, {
            method: 'GET',
            credentials: 'include' // 인증이 필요한 경우 쿠키 전송
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('채팅방 목록을 볼 권한이 없습니다. 로그인이 필요할 수 있습니다.');
                // 로그인 페이지로 리디렉션 필요 시
                // window.location.href = '/login';
            } else {
                throw new Error(`채팅방 목록 로딩 실패: ${response.statusText} (상태 코드: ${response.status})`);
            }
            return;
        }

        // json 객체로 변환
        const chatRoomList = await response.json();
        renderChatRoomList(chatRoomList);

    } catch (error) {
        console.error('채팅방 목록 로딩 중 오류:', error);
        chatRoomListBody.innerHTML = `<tr><td colspan="3">채팅방 목록을 불러오는 중 오류가 발생했습니다. (${error.message})</td></tr>`;
    }
}

/**
 * 채팅방 목록 데이터를 받아 HTML 테이블 행으로 변환하여 표시하는 함수
 * @param {Array<Object>} roomList - 채팅방 목록 데이터 배열 [{roomId, roomName}, ...]
 */
function renderChatRoomList(roomList) {
    chatRoomListBody.innerHTML = ''; // 기존 목록 초기화

    if (!roomList || roomList.length === 0) {
        chatRoomListBody.innerHTML = '<tr><td colspan="3">개설된 채팅방이 없습니다.</td></tr>';
        return;
    }

    roomList.forEach(room => {
        const row = document.createElement('tr');
        // room 객체에 roomId와 roomName이 있는지 확인 (데이터 일관성 체크)
        // const roomId = room.roomId !== undefined ? room.roomId : 'N/A';

        // roomId를 tr 요소의 dataset에 저장 (화면에 안 보임)
        row.dataset.roomId = room.roomId || 'N/A';  // 👈 데이터 저장 위치 변경
        const roomName = room.roomName !== undefined ? room.roomName : '이름 없음';
        const participantCount = room.participantCount !== undefined ? room.participantCount : '0';
        const unreadCount = room.unreadCount !== undefined ? room.unreadCount : '0';

        row.innerHTML = `
                    <td>${escapeHtml(roomName)}</td>
                    <td>${escapeHtml(participantCount)}</td>
                    <td>${escapeHtml(unreadCount)}</td>
                    <td>
                        <button class="btn btn-primary btn-enter-room" data-room-id="${escapeHtml(row.dataset.roomId)}" data-room-name="${escapeHtml(roomName)}">
                            입장하기
                        </button>
                    </td>
                    <td>
                        <button class="btn btn-primary btn-exit-room" data-room-id="${escapeHtml(row.dataset.roomId)}" data-room-name="${escapeHtml(roomName)}">
                            나가기
                        </button>
                    </td>
                `;
        chatRoomListBody.appendChild(row);
    });

    // 동적으로 생성된 '입장하기' 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.btn-enter-room').forEach(button => {
        button.addEventListener('click', handleEnterChatRoom);
    });

    // 동적으로 생성된 '나가기' 버튼에 이벤트 리스너 추가
    document.querySelectorAll('.btn-exit-room').forEach(button => {
        button.addEventListener('click', handleExitChatRoom);
    });
}

/**
 * '입장하기' 버튼 클릭 시 실행될 함수
 * @param {Event} event - 클릭 이벤트
 */
async function handleEnterChatRoom(event) {
    const button = event.target;
    const roomId = button.dataset.roomId;
    const roomName = button.dataset.roomName;

    console.log(`선택된 채팅방 정보: ID=${roomId}, Name=${roomName}`);

    try {
        const url = `${JOIN_CHAT_ROOM_API_URL}/${encodeURIComponent(roomId)}/join`;
        const response = await fetch(url, {
            method: 'POST', // 또는 백엔드가 요구하는 메소드 (GET, POST 등)
            credentials: 'include' // 인증 쿠키 전송
        });

        if(response.ok) {
            // 입장시 해당 채팅방에 존재하는 메시지 읽음 처리
            await fetch(`${API_BASE_URL}/api/v1/chat/room/${roomId}/read`, {
                method: 'POST',
                credentials: 'include'
            });

            // 채팅방 입장 시 채팅방에 존재하는 모든 사용자의 메시지 요소 중 하나인 unreadCount를 프런트로 다시 전송
            await fetch(`${API_BASE_URL}/api/v1/chat/room/${roomId}/unreadUpdate`, {
                method: 'GET',
                credentials: 'include'
            });

            // 해당 컨트롤러 api로 이동
            window.location.href = `/stompChatPage/${roomId}?roomName=${encodeURIComponent(roomName)}`;
        } else {
            alert('채팅방 참여에 실패했습니다.');
        }
    } catch (error) {
        console.error('채팅방 참여 중 오류 발생:', error);
        alert('채팅방 참여 중 오류가 발생했습니다.');
    }
}

/**
 * '나가기' 버튼 클릭 시 실행될 함수
 * @param {Event} event - 클릭 이벤트
 */
async function handleExitChatRoom(event) {
    const button = event.target;
    const roomId = button.dataset.roomId;
    const roomName = button.dataset.roomName;

    console.log(`선택된 채팅방 정보: ID=${roomId}, Name=${roomName}`);

    try {
        const url = `${EXIT_CHAT_ROOM_API_URL}/${encodeURIComponent(roomId)}/leave`;
        const response = await fetch(url, {
            method: 'DELETE', // 또는 백엔드가 요구하는 메소드 (GET, POST 등)
            credentials: 'include' // 인증 쿠키 전송
        });

        if(response.ok) {
            await loadChatRoomList(); // 채팅방 목록 새로고침
        } else {
            alert('채팅방 나가기에 실패했습니다.');
        }
    } catch (error) {
        console.error('채팅방 나가기 중 오류 발생:', error);
        alert('채팅방 나가기 중 오류가 발생했습니다.');
    }
}

// 모달 영역 관련 함수
function openCreateRoomModal() {
    if (createChatRoomModal) createChatRoomModal.style.display = 'block';
    if (newRoomNameInput) newRoomNameInput.value = ''; // 모달 열 때 입력 필드 초기화
    if (newRoomNameInput) newRoomNameInput.focus();    // 입력 필드에 포커스
}

function closeCreateRoomModal() {
    if (createChatRoomModal) createChatRoomModal.style.display = 'none';
}

// 채팅방 생성 함수
async function handleCreateChatRoom() {
    const roomName = newRoomNameInput.value.trim();
    if (!roomName) {
        alert('채팅방 이름을 입력해주세요.');
        newRoomNameInput.focus();
        return;
    }

    // API 요청 URL 구성 (쿼리 파라미터 방식)
    const url = `${CREATE_CHAT_ROOM_API_URL}?roomName=${encodeURIComponent(roomName)}`;

    try {
        const response = await fetch(url, {
            method: 'POST', // 또는 백엔드가 요구하는 메소드 (GET, POST 등)
            credentials: 'include' // 인증 쿠키 전송
            // POST 요청 시 body가 필요하면 headers와 body 추가
            // headers: { 'Content-Type': 'application/json' },
            // body: JSON.stringify({ roomName: roomName }) // 만약 JSON 바디로 보낸다면
        });

        if (!response.ok) {
            let errorMessage = `채팅방 생성 실패 (상태 코드: ${response.status})`;
            try {
                const errorData = await response.json(); // 또는 .text()
                errorMessage = `채팅방 생성 실패: ${errorData.message || response.statusText || '알 수 없는 오류'}`;
            } catch (e) {
                // JSON 파싱 실패 시
            }
            alert(errorMessage);
            return;
        }

        // 성공 시 (백엔드 응답에 따라 처리)
        // const createdRoom = await response.json(); // 생성된 방 정보를 받을 경우
        closeCreateRoomModal();
        await loadChatRoomList(); // 채팅방 목록 새로고침

    } catch (error) {
        console.error('채팅방 생성 요청 중 오류:', error);
        alert(`채팅방 생성 중 오류가 발생했습니다: ${error.message}`);
    }
}

/**
 * 간단한 HTML 이스케이프 함수 (XSS 방지 목적)
 * @param {*} unsafe - 이스케이프할 문자열 또는 값
 * @returns {string} 이스케이프된 HTML 문자열
 */
function escapeHtml(unsafe) {
    if (unsafe === null || typeof unsafe === 'undefined') return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// --- 이벤트 리스너 설정 ---
document.addEventListener('DOMContentLoaded', () => {
    // 페이지 로드 시 채팅방 목록 불러오기
    loadChatRoomList();
    connect();

    if (btnShowCreateRoomModal) {
        btnShowCreateRoomModal.addEventListener('click', openCreateRoomModal);
    }
    if (closeCreateRoomModalBtn) {
        closeCreateRoomModalBtn.addEventListener('click', closeCreateRoomModal);
    }
    if (cancelCreateRoomBtn) {
        cancelCreateRoomBtn.addEventListener('click', closeCreateRoomModal);
    }
    if (confirmCreateRoomBtn) {
        confirmCreateRoomBtn.addEventListener('click', handleCreateChatRoom);
    }
    // 모달 외부 클릭 시 닫기 (선택 사항)
    window.addEventListener('click', (event) => {
        if (event.target === createChatRoomModal) {
            closeCreateRoomModal();
        }
    });
});