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
    // 비밀번호 검증
    api.verifyPassword = async function (data) {
        const options = {
            method:'POST',
            credentials: 'include',
            headers: {
                accepts: 'application/json',
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }

        const response = await fetch(`${SERVER_URL}/bookings/verify`, options);
        if (!response.ok || !response) {
            console.log(`비밀번호가 일치하지 않습니다.`)
            return `비밀번호가 일치하지 않습니다.`;
        }

        // console.log(await response.json());
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

    // 예약 조회(통계) - 사용자별 리스트
    api.getMemberBookingsList = async function() {
        const response = await fetch(`${SERVER_URL}/bookings/me/statistics`, GET_OPTIONS);
        if(!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '요청 실패');
        }

        return await response.json();
    }

    // 예약 조회(통계) - 전체 리스트
    api.getAllBookingsListList = async function() {
        const response = await fetch(`${SERVER_URL}/bookings/statistics`, GET_OPTIONS);
        if(!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '요청 실패');
        }

        return await response.json();
    }

    // 예약 조회 - 사용자별 리스트
    api.getMemberBookings = async function(page) {
        const response = await fetch(`${SERVER_URL}/bookings/me?page=${page}`, GET_OPTIONS);
        if(!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '요청 실패');
        }

        return await response.json();
    }

    // 예약 조회 - 전체 리스트
    api.getAllBookings = async function(page) {
        const response = await fetch(`${SERVER_URL}/bookings?page=${page}`, GET_OPTIONS);
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
    // 예약 변경
    api.updateBooking = async function(bookingNo, data) {
        const options = {
            method: 'PUT',
            credentials: 'include',
            headers: {
                accepts: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        };

        const response = await fetch(`${SERVER_URL}/bookings/${bookingNo}`, options);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '요청 실패');
        }

        return await response.json();
    }

    // 예약 연장
    api.extendBooking = async function(bookingNo) {
        const options = {
            method: 'PUT',
            credentials: 'include',
            headers: {
                accepts: 'application/json',
                'Content-Type': 'application/json',
            }
        };

        const response = await fetch(`${SERVER_URL}/bookings/${bookingNo}/extend`, options);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '요청 실패');
        }

        return await response.json();
    }

    // 예약 종료
    api.finishBooking = async function(bookingNo) {
        const options = {
            method: 'PUT',
            credentials: 'include',
            headers: {
                accepts: 'application/json',
                'Content-Type': 'application/json',
            }
        };

        const response = await fetch(`${SERVER_URL}/bookings/${bookingNo}/finish`, options);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '요청 실패');
        }

        return await response.json();
    }

    // 예약 취소
    api.cancelBooking = async function(bookingNo) {
        const options = {
            method: 'DELETE',
            credentials: 'include'
        };

        const response = await fetch(`${SERVER_URL}/bookings/${bookingNo}`, options);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '요청 실패');
        }

        return await response.json();
    }

    return api;
}