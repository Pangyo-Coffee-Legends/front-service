document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('realtimeEntryChart');
    if (!canvas) {
        console.error(':x: canvas 요소(realtimeEntryChart)를 찾을 수 없습니다.');
        return;
    }

    const ctx = canvas.getContext('2d');

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
        type: 'line',
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
                    },
                    ticks: {
                        stepSize: 1,
                        callback: function (value) {
                            return Number.isInteger(value) ? value : null;
                        }
                    }
                }
            },
            plugins: {
                legend: { display: true }
            }
        }
    });

    let lastProcessedTime = null; //같은 시간의 데이터를 중복 처리하지 않도록 막음

    /**
     * 실시간 데이터 갱신 함수
     */
    async function fetchAndUpdate() {
        try {
            const response = await fetchWithAuth('https://aiot2.live/api/v1/entries/realtime');
            if (response.ok) {
                const data = await response.json();
                if (data.time && typeof data.count === 'number') {
                    if (data.time === lastProcessedTime) {
                        return; // 같은 시간은 무시
                    }
                    lastProcessedTime = data.time;
                    console.log("📡 fetch() called at", new Date());

                    const kstDate = new Date(data.time);
                    const timeLabel = kstDate.getFullYear() + '-' +
                        String(kstDate.getMonth() + 1).padStart(2, '0') + '-' +
                        String(kstDate.getDate()).padStart(2, '0') + ' ' +
                        String(kstDate.getHours()).padStart(2, '0') + ':' +
                        String(kstDate.getMinutes()).padStart(2, '0');


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
                    document.getElementById('max-count').textContent = max.toFixed();
                    document.getElementById('entry-count').textContent = dataset.length;

                    realtimeChart.update();
                }
            } else {
                throw new Error(`서버 응답 오류: ${response.status}`);
            }
        } catch (error) {
            console.error(':x: 실시간 데이터 로드 실패:', error);
        }
    }

    // 초기 실행
    // fetchAndUpdate().catch(console.error);

    // 반복 실행 (60초마다 실행)
    setInterval(fetchAndUpdate,60 * 1000);
});