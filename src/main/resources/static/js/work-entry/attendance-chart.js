/**
 * 근무시간 통계 대시보드 스크립트
 * - 회원 목록 조회 및 선택 기능
 * - 선택 회원의 월간 근무 통계 데이터 시각화 및 표 출력
 * - 연도/월/일 필터 적용
 * - 날짜 선택시 0일로 인한 전월 fallback 오류 방지
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

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    /**
     * 선택한 연도/월에 따라 일(day) 드롭다운을 갱신합니다.
     * '0일' 오류 제거됨
     */
    function updateDaySelector(year, month) {
        daySelector.innerHTML = '<option value="">전체</option>';
        if (!year || !month) return;

        const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        for (let d = 1; d <= days[month - 1]; d++) {
            const option = document.createElement('option');
            option.value = d;
            option.textContent = `${d}일`;
            daySelector.appendChild(option);
        }
    }

    function fetchWithAuth(url, options = {}) {
        return fetch(url, {
            ...options,
            method: 'GET',
            credentials: 'include',
            headers: {
                ...(options.headers || {}),
                'Content-Type': 'application/json',
            }
        });
    }

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

    function renderAttendanceSummary(data, name) {
        const labels = [];
        const workHours = [];
        let totalHours = 0;

        const summaryTable = document.createElement('table');
        summaryTable.className = 'table table-bordered mt-3';
        summaryTable.innerHTML = '<thead><tr><th>날짜</th><th>출근 시간</th><th>퇴근 시간</th><th>총 근무시간 (시간)</th><th>비고</th></tr></thead><tbody></tbody>';
        const tbody = summaryTable.querySelector('tbody');

        data.forEach(item => {
            const {year, monthValue, dayOfMonth} = item;
            const dateObj = new Date(year, monthValue - 1, dayOfMonth);
            const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : '유효하지 않음';

            const inTime = item.inTime ? new Date(item.inTime).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'}) : '-';
            const outTime = item.outTime ? new Date(item.outTime).toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'}) : '-';
            let hours = item.hoursWorked || 0;
            if (hours === 9) hours = 8;

            if (dateStr !== '유효하지 않음') {
                labels.push(dateStr);
                workHours.push(hours);
                totalHours += hours;
            }

            const row = document.createElement('tr');
            row.innerHTML = `<td>${dateStr}</td><td>${inTime}</td><td>${outTime}</td><td>${hours}</td><td>${statusMap[item.code] || '미확인'}</td>`;
            tbody.appendChild(row);
        });

        const avg = workHours.length ? (totalHours / workHours.length).toFixed(2) : '0.00';
        const avgRow = document.createElement('tr');
        avgRow.innerHTML = `<td colspan="3" class="text-end fw-bold">평균 근무시간</td><td colspan="2" class="fw-bold">${avg}</td>`;
        tbody.appendChild(avgRow);

        updateAttendanceChart(`${name}의 근무시간`, {
            labels,
            datasets: [{
                label: '근무시간',
                data: workHours,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        }, {
            responsive: true,
            scales: {
                y: {beginAtZero: true, title: {display: true, text: '근무시간'}},
                x: {title: {display: true, text: '날짜'}}
            },
            plugins: {legend: {display: false}}
        }, avg, summaryTable);
    }

    /**
     * 연도/월/일 필터를 적용하여 해당 회원의 근무 데이터를 다시 렌더링합니다.
     */
    function filterAndRender(name) {
        const year = parseInt(yearInput.value);
        const month = parseInt(monthSelector.value);
        const day = parseInt(daySelector.value);

        let filtered = currentAttendanceData;
        if (!isNaN(year)) filtered = filtered.filter(item => item.year === year);
        if (!isNaN(month)) filtered = filtered.filter(item => item.monthValue === month);
        if (!isNaN(day)) filtered = filtered.filter(item => item.dayOfMonth === day);

        renderAttendanceSummary(filtered, name);
    }

    function loadMemberAttendance(no, name, page = 0, size = 365) {
        fetchWithAuth(`http://localhost:10251/api/v1/attendances/summary/recent/${no}?page=${page}&size=${size}`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                currentAttendanceData = data.content || [];
                currentMemberName = name;
                updateDaySelector(yearInput.value, monthSelector.value);
                filterAndRender(name);
            })
            .catch(() => {
                attendanceChartContainer.innerHTML = `<div class="alert alert-danger">근무 통계를 불러오지 못했습니다.</div>`;
            });
    }

    function loadMemberList(page = 0, size = 10) {
        fetchWithAuth(`http://localhost:10251/api/v1/members?page=${page}&size=${size}`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                const members = data.content;
                const totalPages = data.totalPages;

                const table = document.createElement('table');
                table.className = 'table table-bordered table-hover';
                table.innerHTML = '<thead><tr><th>회원 번호</th><th>이름</th><th>이메일</th><th>전화번호</th></tr></thead><tbody></tbody>';
                const tbody = table.querySelector('tbody');

                members.forEach(member => {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${member.no}</td><td>${member.name}</td><td>${member.email}</td><td>${member.phoneNumber}</td>`;
                    row.addEventListener('click', () => {
                        yearInput.value = '';
                        monthSelector.value = '';
                        updateDaySelector('', '');
                        loadMemberAttendance(member.no, member.name);
                    });
                    tbody.appendChild(row);
                });

                const pagination = document.createElement('div');
                for (let i = 0; i < totalPages; i++) {
                    const btn = document.createElement('button');
                    btn.textContent = `${i + 1}`;
                    btn.className = 'btn btn-sm btn-outline-secondary me-1';
                    btn.addEventListener('click', () => loadMemberList(i));
                    pagination.appendChild(btn);
                }

                memberTableContainer.innerHTML = '';
                memberTableContainer.appendChild(table);
                memberTableContainer.appendChild(pagination);
            })
            .catch(() => {
                memberTableContainer.innerHTML = `<div class="alert alert-danger">회원 목록을 불러오는 데 실패했습니다.</div>`;
            });
    }

    // 🔄 필터 동작 감지 이벤트 연결
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

    loadMemberList();

    setInterval(loadEntryChart, 30 * 60 * 1000);
});
