/**
 * 근무시간 통계 페이지가 로드되면 실행되는 메인 엔트리 함수입니다.
 * - 회원 목록을 불러와 테이블로 출력하고
 * - 특정 회원을 클릭하면 해당 회원의 최근 30일 근무 데이터를 가져와 시각화합니다.
 * - 연도/월/일 필터링 기능을 포함하며, 점심시간 보정 및 상태코드에 따라 색상을 다르게 표시합니다.
 */
document.addEventListener('DOMContentLoaded', function () {
    const memberTableContainer = document.getElementById('member-table-container');
    const attendanceChartContainer = document.getElementById('attendance-chart-container');
    const attendanceTableContainer = document.getElementById('attendance-table-container');
    const yearInput = document.getElementById('yearInput');
    const monthSelector = document.getElementById('monthSelector');
    const daySelector = document.getElementById('daySelector');

    const statusMap = {
        1: "출석", 2: "지각", 3: "결석", 4: "외출",
        5: "휴가", 6: "질병", 7: "조퇴", 8: "기타"
    };

    let currentAttendanceData = [];
    let currentMemberName = '';
    let attendanceChartInstance = null;

    /**
     * 윤년인지 확인합니다.
     * @param {number} year - 검사할 연도
     * @return {boolean} 윤년 여부
     */
    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    /**
     * 월에 따라 일자 셀렉터를 업데이트합니다.
     * @param {string|number} year - 선택된 연도
     * @param {string|number} month - 선택된 월
     */
    function updateDaySelector(year, month) {
        daySelector.innerHTML = '<option value="">전체</option>';
        if (!year || !month) return;

        const monthInt = parseInt(month);
        const yearInt = parseInt(year);
        let days = 30;
        if ([1, 3, 5, 7, 8, 10, 12].includes(monthInt)) days = 31;
        else if (monthInt === 2) days = isLeapYear(yearInt) ? 29 : 28;

        for (let d = 1; d <= days; d++) {
            const option = document.createElement('option');
            option.value = d;
            option.textContent = `${d}일`;
            daySelector.appendChild(option);
        }
    }

    /**
     * 인증 포함 GET 요청 함수입니다.
     * @param {string} url - 요청 URL
     * @param {object} options - fetch 옵션
     * @return {Promise<Response>} 응답 결과
     */
    function fetchWithAuth(url, options = {}) {
        return fetch(url, {
            ...options,
            method: 'GET',
            credentials: 'include',
            headers: { ...(options.headers || {}), 'Content-Type': 'application/json' }
        });
    }

    /**
     * 차트 및 통계 테이블을 렌더링합니다.
     * @param {string} title - 차트 제목
     * @param {object} chartData - Chart.js 데이터
     * @param {object} chartOptions - Chart.js 옵션
     * @param {string|number} avgHours - 평균 근무시간
     * @param {HTMLElement} tableElem - 테이블 DOM 요소
     */
    function updateAttendanceChart(title, chartData, chartOptions, avgHours, tableElem) {
        attendanceChartContainer.innerHTML = '';
        attendanceTableContainer.innerHTML = '';

        const titleElem = document.createElement('h5');
        titleElem.textContent = title;
        titleElem.className = 'mb-3';

        const canvas = document.createElement('canvas');
        canvas.id = 'attendanceChart';
        canvas.style.width = '100%';
        canvas.style.height = '500px';

        attendanceChartContainer.appendChild(titleElem);
        attendanceChartContainer.appendChild(canvas);
        attendanceTableContainer.appendChild(tableElem);

        if (attendanceChartInstance) attendanceChartInstance.destroy();

        attendanceChartInstance = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
    }

    /**
     * 근무 통계 데이터를 표 및 차트로 출력합니다.
     * @param {Array} data - 근무 통계 데이터
     * @param {string} name - 회원 이름
     */
    function renderAttendanceSummary(data, name) {
        const labels = [];
        const workHours = [];
        let totalHours = 0;

        const summaryTable = document.createElement('table');
        summaryTable.className = 'table table-bordered mt-3';
        summaryTable.innerHTML = `
            <thead>
                <tr><th>날짜</th><th>출근 시간</th><th>퇴근 시간</th><th>총 근무시간 (시간)</th><th>비고</th></tr>
            </thead><tbody></tbody>
        `;
        const tbody = summaryTable.querySelector('tbody');

        data.forEach(item => {
            const dateObj = typeof item.workDate === 'string'
                ? new Date(item.workDate)
                : new Date(item.workDate.year, item.workDate.monthValue - 1, item.workDate.dayOfMonth);

            const dateStr = dateObj.toISOString().split('T')[0];
            const inTime = item.inTime ? new Date(item.inTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-';
            const outTime = item.outTime ? new Date(item.outTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-';

            let hours = item.hoursWorked || 0;
            if (hours === 9) hours = 8;

            labels.push(dateStr);
            workHours.push(hours);
            totalHours += hours;

            const row = document.createElement('tr');
            row.innerHTML = `<td>${dateStr}</td><td>${inTime}</td><td>${outTime}</td><td>${hours}</td><td>${statusMap[item.code] || '미확인'}</td>`;

            if (item.code >= 2 && item.code <= 8) {
                const colorMap = {
                    2: '#FF4C4C', // 빨강
                    3: '#FF9900', // 주황
                    4: '#FFFF66', // 노랑
                    5: '#66FF66', // 초록
                    6: '#6699FF', // 파랑
                    7: '#66CCFF', // 남색
                    8: '#CC66FF'  // 보라
                };
                row.style.backgroundColor = colorMap[item.code];
            }

            tbody.appendChild(row);
        });

        const avg = workHours.length > 0 ? (totalHours / workHours.length).toFixed(2) : '0.00';
        const avgRow = document.createElement('tr');
        avgRow.innerHTML = `<td colspan="3" class="text-end fw-bold">평균 근무시간</td><td colspan="2" class="fw-bold">${avg}</td>`;
        tbody.appendChild(avgRow);

        updateAttendanceChart(`👤 ${name}의 근무시간`, {
            labels,
            datasets: [{
                label: '근무시간 (시간)',
                data: workHours,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        }, {
            responsive: true,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: '근무시간 (시간)' } },
                x: { title: { display: true, text: '날짜' } }
            },
            plugins: { legend: { display: false } }
        }, avg, summaryTable);
    }

    /**
     * 연/월/일 기준으로 데이터를 필터링하고 렌더링합니다.
     * @param {string} name - 회원 이름
     */
    function filterAndRender(name) {
        const year = yearInput.value;
        const month = monthSelector.value;
        const day = daySelector.value;

        let filtered = currentAttendanceData;

        if (year) {
            filtered = filtered.filter(item => {
                const date = typeof item.workDate === 'string'
                    ? new Date(item.workDate)
                    : new Date(item.workDate.year, item.workDate.monthValue - 1, item.workDate.dayOfMonth);
                return date.getFullYear() === parseInt(year);
            });
        }

        if (month) {
            filtered = filtered.filter(item => {
                const m = item.workDate.monthValue || new Date(item.workDate).getMonth() + 1;
                return String(m) === month;
            });
        }

        if (day) {
            filtered = filtered.filter(item => {
                const d = item.workDate.dayOfMonth || new Date(item.workDate).getDate();
                return String(d) === day;
            });
        }

        renderAttendanceSummary(filtered, name);
    }

    /**
     * 특정 회원의 근무시간 데이터를 로드합니다.
     * @param {number} no - 회원 번호
     * @param {string} name - 회원 이름
     */
    function loadMemberAttendance(no, name) {
        fetchWithAuth(`/api/v1/attendances/summary/recent/${no}`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                currentAttendanceData = data;
                currentMemberName = name;
                filterAndRender(name);
            })
            .catch(() => {
                attendanceChartContainer.innerHTML = `<div class="alert alert-danger">해당 회원의 근무 통계를 불러오는 데 실패했습니다.</div>`;
            });
    }

    /**
     * 전체 회원 목록을 로드하고 테이블에 출력합니다.
     */
    function loadMemberList() {
        fetchWithAuth('/api/v1/members/info-list')
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(members => {
                members.sort((a, b) => a.no - b.no);
                const table = document.createElement('table');
                table.className = 'table table-bordered table-hover';
                table.innerHTML = `<thead><tr><th>회원 번호</th><th>이름</th><th>이메일</th><th>전화번호</th></tr></thead><tbody></tbody>`;
                const tbody = table.querySelector('tbody');

                members.forEach(member => {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${member.no}</td><td>${member.name}</td><td>${member.email}</td><td>${member.phoneNumber}</td>`;
                    row.style.cursor = 'pointer';
                    row.addEventListener('click', () => {
                        yearInput.value = '';
                        monthSelector.value = '';
                        daySelector.innerHTML = '<option value="">전체</option>';
                        loadMemberAttendance(member.no, member.name);
                    });
                    tbody.appendChild(row);
                });

                memberTableContainer.innerHTML = '';
                memberTableContainer.appendChild(table);
            })
            .catch(() => {
                memberTableContainer.innerHTML = `<div class="alert alert-danger">회원 목록을 불러오는 데 실패했습니다.</div>`;
            });
    }

    // 필터 이벤트 등록
    yearInput.addEventListener('input', () => {
        updateDaySelector(yearInput.value, monthSelector.value);
        if (currentAttendanceData.length > 0) filterAndRender(currentMemberName);
    });

    monthSelector.addEventListener('change', () => {
        updateDaySelector(yearInput.value, monthSelector.value);
        if (currentAttendanceData.length > 0) filterAndRender(currentMemberName);
    });

    daySelector.addEventListener('change', () => {
        if (currentAttendanceData.length > 0) filterAndRender(currentMemberName);
    });

    // 초기 실행
    loadMemberList();
    setInterval(loadMemberList, 1440 * 60 * 1000); // 1일마다 자동 갱신
});
