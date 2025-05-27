// API 기본 URL (실제 환경에 맞게 수정 필요)
// const API_BASE_URL = 'http://localhost:10251';

const memberListBody = document.getElementById('member-list-body');

// 채팅방 생성 공통 모달 요소들
const createChatRoomModal = document.getElementById('createChatRoomModal');
const modalTitle = document.getElementById('modal-title');
const newRoomNameInput = document.getElementById('newRoomNameInput');
const closeCreateRoomModalBtn = document.getElementById('closeCreateRoomModalBtn');
const cancelCreateRoomBtn = document.getElementById('cancelCreateRoomBtn');
const confirmCreateRoomBtn = document.getElementById('confirmCreateRoomBtn');

const CREATE_CHAT_ROOM_API_URL = `${API_BASE_URL}/api/v1/chat/room/group/create`;

const inviteMultipleURL = `${API_BASE_URL}/api/v1/chat/room/group/invite-multiple`;

/** 채팅방 입장 API URL */
const JOIN_CHAT_ROOM_API_URL = `${API_BASE_URL}/api/v1/chat/room/group`;

/**
 * 이메일을 HTML ID로 안전하게 변환
 */
function encodeId(email) {
    return email.replace(/[@.]/g, '_');
}

/**
 * 회원 목록 로딩
 */
async function loadMemberList() {
    try {
        console.log(userEmail);

        const response = await fetch(`${API_BASE_URL}/api/v1/members/list`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                alert('회원 목록을 볼 권한이 없습니다.');
            } else {
                throw new Error(`회원 목록 로딩 실패: ${response.statusText}`);
            }
            return;
        }

        const memberList = await response.json();
        renderMemberList(memberList);

    } catch (error) {
        console.error('회원 목록 로딩 중 오류:', error);
        memberListBody.innerHTML = '<tr><td colspan="4">회원 목록을 불러오는 중 오류가 발생했습니다.</td></tr>';
    }
}

/**
 * 회원 목록 렌더링 (공통 모달 사용)
 */
function renderMemberList(memberList) {
    memberListBody.innerHTML = '';

    if (!memberList || memberList.length === 0) {
        memberListBody.innerHTML = '<tr><td colspan="4">등록된 회원이 없습니다.</td></tr>';
        return;
    }

    memberList.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(member.id)}</td>
            <td>${escapeHtml(member.name)}</td>
            <td>${escapeHtml(member.email)}</td>
            <td>
                <button class="btn btn-primary btn-chat"
                        data-member-id="${escapeHtml(member.id)}"
                        data-member-name="${escapeHtml(member.name)}"
                        data-member-email="${escapeHtml(member.email)}"
                        ${member.email === userEmail ? 'disabled' : ''}>
                    채팅하기
                </button>
            </td>
        `;
        memberListBody.appendChild(row);
    });

    // 채팅 버튼에 이벤트 연결
    document.querySelectorAll('.btn-chat').forEach(button => {
        button.addEventListener('click', handleOpenChatModal);
    });
}

/**
 * 공통 모달 열고 제목/기본값 설정
 */
function handleOpenChatModal(event) {
    const button = event.target;
    const memberName = button.dataset.memberName;
    const memberEmail = button.dataset.memberEmail;

    modalTitle.textContent = `${memberName}님과의 채팅방 생성`;
    newRoomNameInput.value = `${memberName}님과의 1:1 채팅`;

    // invitee 정보 저장 (버튼의 dataset 활용)
    confirmCreateRoomBtn.dataset.invitee = memberEmail;

    if (createChatRoomModal) {
        createChatRoomModal.style.display = 'block';
        newRoomNameInput.focus();
    }
}

/**
 * 모달 닫기
 */
function closeModal() {
    createChatRoomModal.style.display = 'none';
    confirmCreateRoomBtn.removeAttribute('data-invitee');
}

/**
 * 채팅방 생성 요청을 서버로 전송한다.
 */
async function handleCreateChatRoom() {
    const roomName = newRoomNameInput.value.trim();
    const invitedUserEmail = confirmCreateRoomBtn.dataset.invitee;

    if (!roomName) {
        alert('채팅방 이름을 입력해주세요.');
        return newRoomNameInput.focus();
    }

    const url = `${CREATE_CHAT_ROOM_API_URL}?roomName=${encodeURIComponent(roomName)}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include'
        });

        const roomId = await response.json();
        console.log(roomId);

        if (!response.ok) {
            let errorMessage = `채팅방 생성 실패 (코드: ${response.status})`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {}
            return alert(errorMessage);
        }

        closeModal();
        inviteSelectedMembers(invitedUserEmail, roomId);
        handleEnterChatRoom(roomName ,roomId);


    } catch (error) {
        console.error('생성 오류:', error);
        alert(`채팅방 생성 중 오류 발생: ${error.message}`);
    }
}

async function inviteSelectedMembers(invitedUserEmail, roomId) {
    // const memberList = document.getElementById('memberList');
    // const checkboxes = memberList.querySelectorAll('input[type="checkbox"]:checked'); // 선택된 체크박스만 가져오기

    const selectedEmails = [];

    // checkboxes.forEach(checkbox => {
    //     selectedEmails.push(checkbox.value);
    // });

    selectedEmails.push(invitedUserEmail);

    if (selectedEmails.length === 0) {
        alert('초대할 멤버를 선택해주세요.');
        return;
    }

    try {
        const response = await fetch(`${inviteMultipleURL}/${roomId}/join`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ emails: selectedEmails }) // 이메일 목록을 JSON 형태로 전송
        });

    } catch (error) {
        console.error('초대 에러:', error);
        alert('초대 요청 중 오류가 발생했습니다.');
    }
}

/**
 * '입장하기' 버튼 클릭 시 실행
 * @param {Event} event - 클릭 이벤트
 */
async function handleEnterChatRoom(roomName ,roomId) {
    // const { roomId, roomName } = event.target.dataset;

    try {
        const joinResponse = await fetch(`${JOIN_CHAT_ROOM_API_URL}/${encodeURIComponent(roomId)}/join`, {
            method: 'POST',
            credentials: 'include'
        });

        if (joinResponse.ok) {
            await fetch(`${API_BASE_URL}/api/v1/chat/room/${roomId}/read`, { method: 'POST', credentials: 'include' });
            await fetch(`${API_BASE_URL}/api/v1/chat/room/${roomId}/unreadUpdate`, { method: 'GET', credentials: 'include' });

            window.location.href = `/stompChatPage/${roomId}?roomName=${encodeURIComponent(roomName)}`;
        } else {
            alert('채팅방 참여에 실패했습니다.');
        }
    } catch (error) {
        console.error('입장 오류:', error);
        alert('채팅방 참여 중 오류가 발생했습니다.');
    }
}

// XSS 방지를 위한 이스케이프 함수
function escapeHtml(unsafe) {
    if (unsafe === null || typeof unsafe === 'undefined') return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 초기 로딩 및 이벤트 바인딩
document.addEventListener('DOMContentLoaded', () => {
    loadMemberList();

    if (closeCreateRoomModalBtn) closeCreateRoomModalBtn.addEventListener('click', closeModal);
    if (cancelCreateRoomBtn) cancelCreateRoomBtn.addEventListener('click', closeModal);
    if (confirmCreateRoomBtn) confirmCreateRoomBtn.addEventListener('click', handleCreateChatRoom);

    window.addEventListener('click', (event) => {
        if (event.target === createChatRoomModal) closeModal();
    });
});
