function apiStore(){
    const SERVER_URL="http://localhost:10251/api/v1";
    const GET_OPTIONS = {
        method:'GET',
        credentials: 'include',
        headers: {
            accepts: 'application/json',
        }
    }

    const api = new Object();
    // todo 비밀번호 검증
    api.verifyPassword = async function () {

        const response = await fetch(`${SERVER_URL}/members/password/${password}`, GET_OPTIONS);
        if (!response.ok) {
            console.log(`비밀번호가 일치하지 않습니다.`)
            return `비밀번호가 일치하지 않습니다.`;
        }
        return await response.json();
    }

    // 회의실 조회 - 번호
    api.getMeetingRoom = async function(no) {
        const response = await fetch(`${SERVER_URL}/meeting-rooms/${no}`, GET_OPTIONS);
        if(!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '요청 실패');
        }
        return await response.json();
    }

    // 회의실 조회 - 리스트
    api.getMeetingRooms = async function() {
        const response = await fetch(`${SERVER_URL}/meeting-rooms`, GET_OPTIONS);
        if(!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '요청 실패');
        }
        return await response.json();
    }

    // 예약 생성
    api.registerBooking = async function(data) {
        const options = {
            method:'POST',
            credentials: 'include',
            headers: {
                accepts: 'application/json',
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(`${SERVER_URL}/bookings`, options);
        if(!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        return await response.json();
    }

    // 예약 조회
    api.getBooking = async function(no) {
        const response = await fetch(`${SERVER_URL}/bookings/${no}`, GET_OPTIONS);
        if(!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '요청 실패');
        }

        return await response.json();
    }

    // 예약 조회 - 사용자별 리스트
    api.getMemberBooking = async function() {
        const response = await fetch(`${SERVER_URL}/bookings/my`, GET_OPTIONS);
        if(!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '요청 실패');
        }

        return await response.json();
    }

    // 예약 조회 - 전체 리스트
    api.getBookingAll = async function() {
        const response = await fetch(`${SERVER_URL}/bookings`, GET_OPTIONS);
        if(!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '요청 실패');
        }

        return await response.json();
    }

    // 예약 조회 - 날짜별
    api.getDailyBookings = async function(roomNo, date) {
        const response = await fetch(`${SERVER_URL}/bookings/meeting-rooms/${roomNo}/date/${date}`, GET_OPTIONS);
        if(!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        return await response.json();
    }
    // 예약 특이사항 변경(연장, 종료, 예약, 변경 등)
    api.updateBookingChange = async function(bookingNo, changeNo) {
        const options = {
            method: 'PUT',
            credentials: 'include',
            headers: {
                accepts: 'application/json',
                'Content-Type': 'application/json',
            }
        };

        const response = await fetch(`${SERVER_URL}/bookings/${bookingNo}/changes/${changeNo}`, options);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '요청 실패');
        }

        return await response.json();
    }

    return api;
}