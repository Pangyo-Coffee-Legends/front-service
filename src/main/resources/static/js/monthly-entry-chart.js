document.addEventListener('DOMContentLoaded', function () {
    const chartContainer = document.getElementById('chart-container');
    let entryChartInstance = null; // 차트 인스턴스를 저장

    /**
     * Chart.js 차트를 카드 형태로 생성하는 함수
     * @param {string} chartId - 캔버스 ID
     * @param {string} title - 카드 제목
     * @param {object} chartData - Chart.js용 데이터
     * @param {object} chartOptions - Chart.js용 옵션
     */
    function addChart(chartId, title, chartData, chartOptions) {
        // 이미 렌더링된 차트가 있으면 업데이트
        if (entryChartInstance) {
            entryChartInstance.data = chartData;
            entryChartInstance.options = chartOptions;
            entryChartInstance.update();
            return;
        }

        let lastRow = chartContainer.lastElementChild;
        if (!lastRow || lastRow.children.length >= 1) {
            lastRow = document.createElement('div');
            lastRow.className = 'row';
            chartContainer.appendChild(lastRow);
        }

        const col = document.createElement('div');
        col.className = 'col-md-12 mb-4'; // ✅ 너비 100% 사용

        const card = document.createElement('div');
        card.className = 'card shadow-sm';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title';
        cardTitle.textContent = title;

        const canvas = document.createElement('canvas');
        canvas.id = chartId;
        canvas.style.width = '100%';    // ✅ 너비 최대
        canvas.style.height = '500px';  // ✅ 높이 고정

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(canvas);
        card.appendChild(cardBody);
        col.appendChild(card);
        lastRow.appendChild(col);

        // 최초 렌더링된 차트 저장
        entryChartInstance = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: chartData,
            options: chartOptions
        });
    }

    /**
     * InfluxDB API로부터 데이터를 가져와 차트를 생성 또는 갱신합니다.
     */
    function loadEntryChart() {
        fetch('/api/v1/entries/monthly')
            .then(res => {
                if (!res.ok) throw new Error("응답 실패");
                return res.json();
            })
            .then(data => {
                const labels = data.map(item => item.date);
                const counts = data.map(item => item.count);

                const chartData = {
                    labels: labels,
                    datasets: [{
                        label: '일별 출입 횟수',
                        data: counts,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                };

                const chartOptions = {
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
                };

                addChart('entryChart', '월간 출입 통계', chartData, chartOptions);
            })
            .catch(error => {
                console.error('❌ Influx 데이터 요청 실패:', error);
                chartContainer.innerHTML = `<div class="alert alert-danger">출입 통계를 불러오지 못했습니다.</div>`;
            });
    }

    // 최초 로드
    loadEntryChart();

    // ⏱ 30분마다 자동으로 새로 로드
    setInterval(loadEntryChart, 30 * 60 * 1000);
});
