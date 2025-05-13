document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('realtimeEntryChart').getContext('2d');

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

    const realtimeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '출입 횟수',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '시간 '
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '출입 횟수'
                    }
                }
            },
            plugins: {
                legend: { display: true }
            }
        }
    });

    /**
     * 실시간 데이터 갱신 함수
     */
    async function fetchAndUpdate() {
        try {
            const response = await fetchWithAuth('http://localhost:10251/api/v1/entries/realtime');
            const data = await response.json();

            if (data.time && typeof data.count === 'number') {
                const kstDate = new Date(new Date(data.time).getTime() + 9 * 60 * 60 * 1000);
                const timeLabel = kstDate.toTimeString().substring(0, 5);

                if (!realtimeChart.data.labels.includes(timeLabel)) {
                    realtimeChart.data.labels.push(timeLabel);
                    realtimeChart.data.datasets[0].data.push(data.count);
                }

                const dataset = realtimeChart.data.datasets[0].data;
                const avg = (dataset.reduce((a, b) => a + b, 0) / dataset.length).toFixed(2);
                const max = Math.max(...dataset);

                document.getElementById('latest-time').textContent = timeLabel;
                document.getElementById('latest-count').textContent = data.count;
                document.getElementById('average-count').textContent = avg;
                document.getElementById('max-count').textContent = max;
                document.getElementById('entry-count').textContent = dataset.length;

                realtimeChart.update();
            }
        } catch (error) {
            console.error('❌ 실시간 데이터 로드 실패:', error);
        }
    }

    /**
     * 시계 출력 함수 (초 단위 표시)
     */
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}:${seconds}`;
        document.getElementById('clock').textContent = `현재 시각: ${timeStr}`;
    }

    // 초기 실행
    fetchAndUpdate();
    updateClock();

    // 반복 실행 (데이터: 10초, 시계: 1초)
    setInterval(fetchAndUpdate,60 * 1000);
    setInterval(updateClock, 1000);
});
