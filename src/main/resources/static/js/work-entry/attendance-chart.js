document.addEventListener('DOMContentLoaded', function () {
    const yearInput = document.getElementById('yearInput');
    const monthSelector = document.getElementById('monthSelector');
    const weekSelector = document.getElementById('weekSelector');
    const searchBtn = document.getElementById('searchBtn');
    const statusSearchBtn = document.getElementById('statusSearchBtn');
    const memberTableContainer = document.getElementById('member-table-container');
    const attendanceChartContainer = document.getElementById('attendance-chart-container');
    const attendanceTableContainer = document.getElementById('attendance-table-container');
    const statusGroup = document.getElementById('status-checkbox-group');

    const statusMap = {
        1: "출근", 2: "지각", 3: "결근", 4: "외근",
        5: "연차", 6: "병가", 7: "반차", 8: "경조사휴가"
    };

    let currentMemberNo = null;
    let currentMemberName = '';
    let currentData = [];
    let chartInstance = null;

    function getWeekOfMonth(dayOfMonth) {
        return Math.floor((dayOfMonth - 1) / 7) + 1;
    }

    function fetchWithAuth(url) {
        return fetch(url, { method: 'GET', credentials: 'include' });
    }

    function renderWeeklyTable(data) {
        attendanceTableContainer.innerHTML = '';

        const table = document.createElement('table');
        table.className = 'table table-bordered';
        table.innerHTML = '<thead><tr><th>날짜</th><th>출근</th><th>퇴근</th><th>근무시간</th><th>비고</th></tr></thead><tbody></tbody>';
        const tbody = table.querySelector('tbody');

        let total = 0;
        data.forEach(item => {
            const dateStr = `${item.year}-${String(item.monthValue).padStart(2, '0')}-${String(item.dayOfMonth).padStart(2, '0')}`;
            const inTime = item.inTime ? new Date(item.inTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-';
            const outTime = item.outTime ? new Date(item.outTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-';
            let h = item.hoursWorked || 0;
            if (h === 9) h = 8;
            total += h;

            const row = document.createElement('tr');
            row.innerHTML = `<td>${dateStr}</td><td>${inTime}</td><td>${outTime}</td><td class="text-end">${h}</td><td>${statusMap[item.code]}</td>`;
            const rowClass = getRowClass(item.code);
            if (rowClass) row.classList.add(rowClass);
            tbody.appendChild(row);
        });

        const avg = data.length ? (total / data.length).toFixed(2) : '0.00';
        const avgRow = document.createElement('tr');
        avgRow.innerHTML = `
        <td colspan="3" class="text-end fw-bold">평균 근무시간</td>
        <td class="text-end fw-bold">${avg}</td> <!-- 📌 평균도 오른쪽 정렬 -->
        <td></td>
    `;
        tbody.appendChild(avgRow);
        attendanceTableContainer.appendChild(table);
    }

    function renderWeeklyChart(data, titleText) {
        attendanceChartContainer.innerHTML = '';

        const title = document.createElement('h5');
        title.className = 'fw-bold mb-3';
        title.textContent = titleText;
        attendanceChartContainer.appendChild(title);

        const canvasWrapper = document.createElement('div');
        canvasWrapper.style.width = '100%';
        canvasWrapper.style.maxWidth = '100%';
        canvasWrapper.style.height = '420px';
        canvasWrapper.style.margin = '0 auto';

        const canvas = document.createElement('canvas');
        canvas.id = 'attendanceChart';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvasWrapper.appendChild(canvas);
        attendanceChartContainer.appendChild(canvasWrapper);

        const labels = [];
        const hours = [];

        data.forEach(item => {
            const dateStr = `${item.year}-${String(item.monthValue).padStart(2, '0')}-${String(item.dayOfMonth).padStart(2, '0')}`;
            let h = item.hoursWorked || 0;
            if (h === 9) h = 8;
            labels.push(dateStr);
            hours.push(h);
        });

        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }

        const ctx = document.getElementById('attendanceChart').getContext('2d');
        chartInstance = new Chart(ctx, {
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
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: '근무시간' } },
                    x: { title: { display: true, text: '날짜' } }
                },
                plugins: { legend: { display: true } }
            }
        });
    }

    function getRowClass(code) {
        return {
            2: 'status-warning',
            3: 'status-danger',
            4: 'status-blue',
            5: 'status-purple',
            6: 'status-green',
            7: 'status-orange',
            8: 'status-pink'
        }[code] || '';
    }

    function fetchAttendance() {
        const y = parseInt(yearInput.value);
        const m = parseInt(monthSelector.value);
        const w = parseInt(weekSelector.value);

        if (!currentMemberNo || isNaN(y) || isNaN(m)) {
            alert('연도와 월을 선택해주세요.');
            return;
        }

        fetchWithAuth(`http://localhost:10251/api/v1/attendances/${currentMemberNo}/summary/recent`)
            .then(res => res.json())
            .then(json => {
                currentData = json.content.filter(it => it.year === y && it.monthValue === m);
                if (!currentData.length) {
                    alert('데이터가 없습니다.');
                    attendanceChartContainer.innerHTML = '';
                    attendanceTableContainer.innerHTML = '';
                    return;
                }

                const rowEl = document.getElementById('attendance-row');
                const chartCol = document.getElementById('attendance-chart-container');
                const tableCol = document.getElementById('attendance-table-container');

                if (!isNaN(w)) {
                    const weekData = currentData.filter(it => getWeekOfMonth(it.dayOfMonth) === w);
                    if (!weekData.length) {
                        alert(`${w}주차 데이터가 없습니다.`);
                        return;
                    }
                    chartCol.className = 'col-md-7';
                    tableCol.className = 'col-md-5';
                    renderWeeklyChart(weekData, `${currentMemberName}의 근무시간 (${w}주차)`);
                    renderWeeklyTable(weekData);
                } else {
                    chartCol.className = 'col-md-12';
                    tableCol.className = 'd-none';
                    renderWeeklyChart(currentData, `${currentMemberName}의 월간 근무시간`);
                }
            });
    }

    function filterByStatus() {
        const checked = [...statusGroup.querySelectorAll('input[type=checkbox]:checked')]
            .map(cb => parseInt(cb.value))
            .filter(v => !isNaN(v));

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
                    backgroundColor: Object.keys(grouped).map(code => getBarColor(parseInt(code)))
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true },
                    x: { title: { display: true, text: '근태 상태' } }
                }
            }
        });

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

    function getBarColor(code) {
        return {
            2: '#ffe699', 3: '#f8d7da', 4: '#cce5ff',
            5: '#e2d5f8', 6: '#d4edda', 7: '#ffe5b4', 8: '#fce4ec'
        }[code] || '#ccc';
    }

    const defaultPageSize = 10;
    let currentPage=0;
    function loadMemberList(page = 0, size = defaultPageSize) {
        fetch(`http://localhost:10251/api/v1/members?page=${page}&size=${size}`, { credentials: 'include' })
            .then(res => res.json())
            .then(json => {
                const table = document.createElement('table');
                table.className = 'table table-bordered table-hover';
                table.innerHTML = '<thead><tr><th style="width: 20%;">회원 번호</th><th style="width: 80%;">이름</th></tr></thead><tbody></tbody>';
                const tbody = table.querySelector('tbody');

                json.content.forEach(mem => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${mem.no}</td><td>${mem.name}</td>`;
                    tr.onclick = () => {
                        currentMemberNo = mem.no;
                        currentMemberName = mem.name;
                        tbody.querySelectorAll('tr').forEach(row => row.classList.remove('selected-member'));
                        tr.classList.add('selected-member');
                        document.getElementById('attendance-chart-container').innerHTML = `
                        <div class="alert alert-info d-flex justify-content-between align-items-center">
                            <span>조회할 연도와 월을 선택하세요.</span>
                            <span class="fw-bold">선택한 사원: ${currentMemberName}</span>
                        </div>`;
                    };
                    tbody.appendChild(tr);
                });

                const container = document.getElementById('member-table-container');
                container.innerHTML = '';
                container.appendChild(table);

                // 페이지네이션 정보 업데이트
                document.getElementById('currentPageText').textContent = `페이지 ${page + 1}`;
                const prevBtn = document.getElementById('prevPageBtn');
                const nextBtn = document.getElementById('nextPageBtn');

                prevBtn.disabled = page === 0;
                nextBtn.disabled = json.last;

                prevBtn.onclick = () => {
                    if (page > 0) {
                        currentPage--;
                        loadMemberList(currentPage, size);
                    }
                };

                nextBtn.onclick = () => {
                    if (!json.last) {
                        currentPage++;
                        loadMemberList(currentPage, size);
                    }
                };
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


        fetchWithAuth(`http://localhost:10251/api/v1/attendances/${currentMemberNo}/summary/recent`)
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

    searchBtn.onclick = fetchAttendance;
    statusSearchBtn.onclick = filterByStatus;
    loadMemberList();
});
