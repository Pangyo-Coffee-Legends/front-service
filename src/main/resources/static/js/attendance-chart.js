document.addEventListener('DOMContentLoaded', function () {
    const memberTableContainer = document.getElementById('member-table-container');
    const attendanceChartContainer = document.getElementById('attendance-chart-container');
    let attendanceChartInstance = null;

    /**
     * 차트 생성 또는 업데이트
     * @param {string} title - 차트 제목
     * @param {Object} chartData - 차트 데이터
     * @param {Object} chartOptions - 차트 옵션
     */
    function updateAttendanceChart(title, chartData, chartOptions) {
        attendanceChartContainer.innerHTML = ''; // 기존 차트 제거

        const titleElem = document.createElement('h5');
        titleElem.textContent = title;
        titleElem.className = 'mb-3';

        const canvas = document.createElement('canvas');
        canvas.id = 'attendanceChart';
        canvas.style.width = '100%';
        canvas.style.height = '400px';

        attendanceChartContainer.appendChild(titleElem);
        attendanceChartContainer.appendChild(canvas);

        attendanceChartInstance = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
    }

    /**
     * 전체 회원 목록 테이블 생성
     * @param {Array} members
     */
    function createMemberTable(members) {
        memberTableContainer.innerHTML = '';

        const table = document.createElement('table');
        table.className = 'table table-bordered table-hover';

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>회원 번호</th>
                <th>이름</th>
                <th>이메일</th>
                <th>전화번호</th>
                <th>가입일자</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        members.forEach(member => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.mbNo}</td>
                <td>${member.mbName}</td>
                <td>${member.mbEmail}</td>
                <td>${member.phoneNumber}</td>
                <td>${new Date(member.createdAt).toLocaleDateString()}</td>
            `;
            row.style.cursor = 'pointer';
            row.addEventListener('click', () => {
                loadMemberAttendance(member.mbNo, member.mbName);
            });
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        memberTableContainer.appendChild(table);
    }

    /**
     * 전체 근무시간 통계 차트 로딩
     */
    function loadTotalAttendanceChart() {
        fetch('/api/v1/attendances/summary/recent')
            .then(res => {
                if (!res.ok) throw new Error('출결 데이터 요청 실패');
                return res.json();
            })
            .then(data => {
                const labels = data.map(item => item.mbName);
                const workHours = data.map(item => {
                    const inTime = new Date(item.inTime);
                    const outTime = new Date(item.outTime);
                    const hours = (outTime - inTime) / (1000 * 60 * 60);
                    return isNaN(hours) ? 0 : parseFloat(hours.toFixed(2));
                });

                updateAttendanceChart(
                    '📊 최근 7일간 전체 근무시간 요약',
                    {
                        labels: labels,
                        datasets: [{
                            label: '총 근무시간 (시간)',
                            data: workHours,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: '근무시간 (시간)' }
                            },
                            x: {
                                title: { display: true, text: '직원 이름' }
                            }
                        },
                        plugins: { legend: { display: false } }
                    }
                );
            })
            .catch(error => {
                attendanceChartContainer.innerHTML = `<div class="alert alert-danger">전체 통계를 불러오는 데 실패했습니다.</div>`;
                console.error(error);
            });
    }

    /**
     * 특정 회원의 근무 통계 로딩
     * @param {number} mbNo - 회원 번호
     * @param {string} mbName - 회원 이름
     */
    function loadMemberAttendance(mbNo, mbName) {
        fetch(`/api/v1/attendances/summary/recent/${mbNo}`)
            .then(res => {
                if (!res.ok) throw new Error('회원 근무 통계 요청 실패');
                return res.json();
            })
            .then(data => {
                const labels = data.map(item => item.date); // 서버에서 날짜 포함되어야 함
                const workHours = data.map(item => {
                    const inTime = new Date(item.inTime);
                    const outTime = new Date(item.outTime);
                    const hours = (outTime - inTime) / (1000 * 60 * 60);
                    return isNaN(hours) ? 0 : parseFloat(hours.toFixed(2));
                });

                updateAttendanceChart(
                    `👤 ${mbName}의 최근 근무시간`,
                    {
                        labels: labels,
                        datasets: [{
                            label: '근무시간 (시간)',
                            data: workHours,
                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1
                        }]
                    },
                    {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: '근무시간 (시간)' }
                            },
                            x: {
                                title: { display: true, text: '날짜' }
                            }
                        },
                        plugins: { legend: { display: false } }
                    }
                );
            })
            .catch(error => {
                attendanceChartContainer.innerHTML = `<div class="alert alert-danger">해당 회원의 통계를 불러오는 데 실패했습니다.</div>`;
                console.error(error);
            });
    }

    /**
     * 전체 회원 목록 불러오기
     */
    function loadMemberList() {
        fetch('/api/v1/members')
            .then(res => {
                if (!res.ok) throw new Error('회원 목록 요청 실패');
                return res.json();
            })
            .then(data => {
                createMemberTable(data);
            })
            .catch(error => {
                memberTableContainer.innerHTML = `<div class="alert alert-danger">회원 목록을 불러오는 데 실패했습니다.</div>`;
                console.error(error);
            });
    }

    // 초기 데이터 로딩
    loadMemberList();
    loadTotalAttendanceChart();

    // 30분 마다 자동 새로고침
    setInterval(()=>{
        loadMemberList();
        loadTotalAttendanceChart();
    },30 * 60 * 1000);
});
