/**
 * 근무시간 통계 페이지 로딩 시 실행되는 메인 스크립트입니다.
 * - 회원 목록 조회
 * - 날짜 필터링 UI 렌더링
 * - 근무 통계 차트 및 표 출력
 * - 근태 상태 필터링 기능
 * - '모두' 체크박스를 통한 전체 상태 선택 제어
 */
document.addEventListener('DOMContentLoaded', function () {
    // ======= 요소 참조 =======
    const yearInput = document.getElementById('yearInput');
    const monthSelector = document.getElementById('monthSelector');
    const daySelector = document.getElementById('daySelector');
    const searchBtn = document.getElementById('searchBtn');
    const statusSearchBtn = document.getElementById('statusSearchBtn');
    const memberTableContainer = document.getElementById('member-table-container');
    const attendanceChartContainer = document.getElementById('attendance-chart-container');
    const attendanceTableContainer = document.getElementById('attendance-table-container');
    const statusGroup = document.getElementById('status-checkbox-group');

    /**
     * 근태 상태 코드에 대한 한글 매핑
     * @type {Object<number, string>}
     */
    const statusMap = {
        1: "출석", 2: "지각", 3: "결석", 4: "외출",
        5: "휴가", 6: "질병", 7: "조퇴", 8: "기타"
    };

    // ======= 전역 상태 변수 =======
    let currentMemberNo = null;      // 현재 선택된 회원 번호
    let currentMemberName = '';      // 현재 선택된 회원 이름
    let currentData = [];            // 현재 조회된 근무 데이터
    let weeklyChunks = [];           // 주차 단위로 나눈 근무 데이터
    let currentPage = 0;             // 현재 주차 페이지
    let chartInstance = null;        // Chart.js 인스턴스

    /**
     * 윤년 여부를 확인합니다.
     * @param {number} year - 연도
     * @returns {boolean} 윤년일 경우 true 반환
     */
    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    /**
     * 월에 따른 일(day) 셀렉터 옵션을 생성합니다.
     * @param {number} year - 선택된 연도
     * @param {number} month - 선택된 월
     */
    function updateDaySelector(year, month) {
        daySelector.innerHTML = '<option value="">전체</option>';
        if (!year || !month) return;
        const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        for (let i = 1; i <= days[month - 1]; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}일`;
            daySelector.appendChild(option);
        }
    }

    /**
     * 쿠키 기반 인증 포함 fetch 함수
     * @param {string} url - API 주소
     * @returns {Promise<Response>} fetch 응답
     */
    function fetchWithAuth(url) {
        return fetch(url, {method: 'GET', credentials: 'include'});
    }

    /**
     * 주차 단위로 근무 데이터를 표 및 차트로 렌더링합니다.
     * @param {Array<Object>} data - 근무 데이터
     */
    function renderWeeklyTable(data) {
        attendanceChartContainer.innerHTML = '';
        attendanceTableContainer.innerHTML = '';

        const weeklyData = data.slice(currentPage * 7, currentPage * 7 + 7);
        const labels = [];
        const hours = [];
        let total = 0;

        const table = document.createElement('table');
        table.className = 'table table-bordered';
        table.innerHTML = '<thead><tr><th>날짜</th><th>출근</th><th>퇴근</th><th>근무시간</th><th>비고</th></tr></thead><tbody></tbody>';
        const tbody = table.querySelector('tbody');

        weeklyData.forEach(item => {
            const dateStr = `${item.year}-${String(item.monthValue).padStart(2, '0')}-${String(item.dayOfMonth).padStart(2, '0')}`;
            const inTime = item.inTime ? new Date(item.inTime).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
            }) : '-';
            const outTime = item.outTime ? new Date(item.outTime).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
            }) : '-';
            let h = item.hoursWorked || 0;
            if (h === 9) h = 8;  // 점심시간 포함 판단 시 9 → 8로 표시

            total += h;
            labels.push(dateStr);
            hours.push(h);

            const row = document.createElement('tr');
            row.innerHTML = `<td>${dateStr}</td><td>${inTime}</td><td>${outTime}</td><td>${h}</td><td>${statusMap[item.code]}</td>`;
            switch (item.code) {
                case 2:
                    row.classList.add('status-warning');
                    break;
                case 3:
                    row.classList.add('status-danger');
                    break;
                case 4:
                    row.classList.add('status-blue');
                    break;
                case 5:
                    row.classList.add('status-purple');
                    break;
                case 6:
                    row.classList.add('status-green');
                    break;
                case 7:
                    row.classList.add('status-orange');
                    break;
                case 8:
                    row.classList.add('status-pink');
                    break;
            }
            tbody.appendChild(row);
        });

        const avg = weeklyData.length ? (total / weeklyData.length).toFixed(2) : '0.00';
        const avgRow = document.createElement('tr');
        avgRow.innerHTML = `<td colspan="3" class="text-end fw-bold">평균 근무시간</td><td colspan="2" class="fw-bold">${avg}</td>`;
        tbody.appendChild(avgRow);
        attendanceTableContainer.appendChild(table);

        // 차트 그리기
        const canvas = document.createElement('canvas');
        attendanceChartContainer.appendChild(canvas);
        const title = document.createElement('h5');
        title.className = 'fw-bold mb-3';
        title.textContent = `${currentMemberName}의 근무시간 (${currentPage + 1}주차)`;
        attendanceChartContainer.prepend(title);

        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: '근무시간',
                    data: hours,
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {beginAtZero: true, title: {display: true, text: '근무시간'}},
                    x: {title: {display: true, text: '날짜'}}
                }
            }
        });

        // 페이지 이동 컨트롤 버튼 추가
        const control = document.createElement('div');
        control.className = 'mt-2 text-center';
        control.innerHTML = `
            <button class="btn btn-outline-secondary btn-sm me-2" ${currentPage === 0 ? 'disabled' : ''}>이전</button>
            <span class="fw-bold">주 ${currentPage + 1} / ${Math.ceil(data.length / 7)}</span>
            <button class="btn btn-outline-secondary btn-sm ms-2" ${currentPage >= Math.ceil(data.length / 7) - 1 ? 'disabled' : ''}>다음</button>
        `;
        control.querySelectorAll('button')[0].onclick = () => {
            currentPage--;
            renderWeeklyTable(currentData);
        };
        control.querySelectorAll('button')[1].onclick = () => {
            currentPage++;
            renderWeeklyTable(currentData);
        };
        attendanceTableContainer.appendChild(control);
    }

    /**
     * 체크된 상태코드만 필터링하여 차트 및 테이블로 출력합니다.
     */
    function filterByStatus() {
        const checked = [...statusGroup.querySelectorAll('input[type=checkbox]:checked')].map(cb => parseInt(cb.value)).filter(v => !isNaN(v));
        if (!checked.length || !currentData.length) return;

        const filtered = currentData.filter(item => checked.includes(item.code));
        const grouped = {};
        filtered.forEach(item => {
            grouped[item.code] = (grouped[item.code] || 0) + 1;
        });

        attendanceChartContainer.innerHTML = '';
        attendanceTableContainer.innerHTML = '';

        const canvas = document.createElement('canvas');
        attendanceChartContainer.appendChild(canvas);

        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(grouped).map(code => statusMap[parseInt(code)]),
                datasets: [{
                    label: '건수',
                    data: Object.values(grouped),
                    backgroundColor: Object.keys(grouped).map(code => {
                        switch (parseInt(code)) {
                            case 2:
                                return '#ffe699';
                            case 3:
                                return '#f8d7da';
                            case 4:
                                return '#cce5ff';
                            case 5:
                                return '#e2d5f8';
                            case 6:
                                return '#d4edda';
                            case 7:
                                return '#ffe5b4';
                            case 8:
                                return '#fce4ec';
                            default:
                                return '#ccc';
                        }
                    })
                }]
            },
            options: {
                plugins: {legend: {display: false}},
                scales: {
                    y: {beginAtZero: true},
                    x: {title: {display: true, text: '근태 상태'}}
                }
            }
        });

        // 통계 테이블 생성
        const table = document.createElement('table');
        table.className = 'table table-bordered mt-3';
        table.innerHTML = '<thead><tr><th>근태 상태</th><th>건수</th></tr></thead><tbody></tbody>';
        const tbody = table.querySelector('tbody');

        Object.entries(grouped).forEach(([code, count]) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${statusMap[parseInt(code)]}</td><td>${count}</td>`;
            tbody.appendChild(row);
        });

        attendanceTableContainer.appendChild(table);
    }

    /**
     * 회원 목록 테이블을 조회 및 표시합니다.
     * 클릭 시 해당 회원의 근무 데이터를 조회 가능하게 합니다.
     */
    function loadMemberList() {
        fetchWithAuth('http://localhost:10251/api/v1/members?page=0&size=10')
            .then(res => res.json())
            .then(json => {
                const table = document.createElement('table');
                table.className = 'table table-bordered table-hover';
                table.innerHTML = '<thead><tr><th>회원 번호</th><th>이름</th><th>이메일</th><th>전화번호</th></tr></thead><tbody></tbody>';
                const tbody = table.querySelector('tbody');

                json.content.forEach(mem => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${mem.no}</td><td>${mem.name}</td><td>${mem.email}</td><td>${mem.phoneNumber}</td>`;
                    tr.onclick = () => {
                        currentMemberNo = mem.no;
                        currentMemberName = mem.name;
                        tbody.querySelectorAll('tr').forEach(row => row.classList.remove('selected-member'));
                        tr.classList.add('selected-member');
                        attendanceChartContainer.innerHTML = `
                            <div class="alert alert-info d-flex justify-content-between align-items-center">
                                <span>조회할 연도와 월을 선택하세요.</span>
                                <span class="fw-bold">선택한 사원: ${currentMemberName}</span>
                            </div>`;
                    };
                    tbody.appendChild(tr);
                });

                memberTableContainer.innerHTML = '';
                memberTableContainer.appendChild(table);
            });
    }

    /**
     * 선택된 회원, 연도, 월, 일에 대한 근무 데이터를 불러옵니다.
     * 조건이 충족되지 않을 경우 경고창을 띄웁니다.
     */
    function fetchAttendance() {
        const y = parseInt(yearInput.value);
        const m = parseInt(monthSelector.value);
        const d = parseInt(daySelector.value);

        if (!currentMemberNo || isNaN(y) || isNaN(m)) {
            alert('연도와 월을 모두 선택해주세요.');
            return;
        }

        fetchWithAuth(`http://localhost:10251/api/v1/attendances/summary/recent/${currentMemberNo}`)
            .then(res => res.json())
            .then(json => {
                currentData = json.content.filter(it => it.year === y && it.monthValue === m);
                if (!isNaN(d)) currentData = currentData.filter(it => it.dayOfMonth === d);
                if (!currentData.length) {
                    alert('해당 기간의 데이터가 없습니다.');
                    attendanceChartContainer.innerHTML = '';
                    attendanceTableContainer.innerHTML = '';
                    return;
                }

                currentPage = 0;
                weeklyChunks = [];
                for (let i = 0; i < currentData.length; i += 7) {
                    weeklyChunks.push(currentData.slice(i, i + 7));
                }

                renderWeeklyTable(currentData);
            });
    }

    // ======= '모두' 체크박스 생성 및 제어 로직 추가 =======
    const allCheckbox = document.createElement('label');
    allCheckbox.innerHTML = `<input type="checkbox" id="status-all-checkbox"> <span></span> 모두`;
    statusGroup.prepend(allCheckbox);

    const statusCheckboxes = statusGroup.querySelectorAll('input[type=checkbox]:not(#status-all-checkbox)');
    document.getElementById('status-all-checkbox').addEventListener('change', function () {
        statusCheckboxes.forEach(cb => cb.checked = this.checked);
    });
    statusCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            document.getElementById('status-all-checkbox').checked = [...statusCheckboxes].every(cb => cb.checked);
        });
    });

    // ======= 초기 실행 및 이벤트 바인딩 =======
    yearInput.oninput = () => updateDaySelector(yearInput.value, monthSelector.value);
    monthSelector.onchange = () => updateDaySelector(yearInput.value, monthSelector.value);
    searchBtn.onclick = fetchAttendance;
    statusSearchBtn.onclick = filterByStatus;
    loadMemberList();
    setInterval(() => location.reload(), 24 * 60 * 60 * 1000); // 하루마다 새로고침
});
