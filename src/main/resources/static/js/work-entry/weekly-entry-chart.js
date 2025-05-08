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

document.addEventListener('DOMContentLoaded', function () {
    const chartCtx = document.getElementById('entryChart').getContext('2d');
    const summaryTableBody = document.getElementById('summaryTableBody');

    let entryChart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '출입자 수',
                data: [],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '출입 횟수(회)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '날짜(YYYY-MM-DD)'
                    },
                    ticks: {
                        autoSkip: true,
                        maxRotation: 0,
                        minRotation: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });

    /**
     * 요약 테이블 최신화 함수 (최근 10개)
     * @param {Array} data - 날짜와 출입 수 배열
     */
    function updateSummaryTable(data) {
        summaryTableBody.innerHTML = '';
        data.slice(-10).reverse().forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${item.date}</td><td>${item.count}</td>`;
            summaryTableBody.appendChild(row);
        });
    }

    /**
     * 서버에서 출입 통계 데이터 불러오기
     */
    function loadEntryChart() {
        fetchWithAuth('http://localhost:10251/api/v1/entries/weekly')
            .then(res => {
                if (!res.ok) throw new Error("응답 실패");
                return res.json();
            })
            .then(data => {
                const labels = data.map(item => item.date);
                const counts = data.map(item => item.count);

                entryChart.data.labels = labels;
                entryChart.data.datasets[0].data = counts;
                entryChart.update();

                updateSummaryTable(data);
            })
            .catch(error => {
                console.error('❌ 출입 통계 로딩 실패:', error);
            });
    }

    // 최초 실행
    loadEntryChart();
    setInterval(loadEntryChart, 30 * 60 * 1000); // 30분마다 갱신
});
