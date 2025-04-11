document.addEventListener('DOMContentLoaded', function () {
    const chartContainer = document.getElementById('chart-container');

    // 동적으로 차트를 추가하는 함수
    function addChart(chartId, chartType, chartData, chartOptions) {
        // 마지막 행 확인 (없거나 이미 2개의 차트가 있으면 새 행 생성)
        let lastRow = chartContainer.lastElementChild;
        if (!lastRow || lastRow.children.length >= 2) {
            lastRow = document.createElement('div');
            lastRow.className = 'row';
            chartContainer.appendChild(lastRow);
        }

        // 새로운 열 생성
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-4';

        // 카드 생성
        const card = document.createElement('div');
        card.className = 'card shadow-sm';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const cardTitle = document.createElement('h5');
        cardTitle.className = 'card-title';
        cardTitle.textContent = `Chart ${chartId}`;

        const canvas = document.createElement('canvas');
        canvas.id = chartId;

        // 구조 조합
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(canvas);
        card.appendChild(cardBody);
        col.appendChild(card);
        lastRow.appendChild(col);

        // Chart.js로 차트 생성
        new Chart(canvas.getContext('2d'), {
            type: chartType,
            data: chartData,
            options: chartOptions
        });
    }

    // 예제 차트 추가
    addChart('chart1', 'bar', {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [{
            label: 'Monthly Sales',
            data: [10, 20, 30, 40, 50],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54,162,235,1)',
                'rgba(255,206,86,1)',
                'rgba(75,192,192,1)',
                'rgba(153,102,255,1)'
            ],
            borderWidth: 1
        }]
    }, {
        responsive: true,
        scales: {
            y: { beginAtZero: true }
        }
    });

    addChart('chart2', 'line', {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            borderColor: 'rgba(255,99,132,.8)',
            backgroundColor: 'rgba(255,99,132,.3)',
            borderWidth: 2
        }]
    }, {
        responsive: true,
        scales: {
            y: { beginAtZero: true }
        }
    });

    // 새로운 차트를 추가하려면 아래와 같이 호출하면 됩니다.
    addChart('chart3', 'pie', {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [{
            label: '# of Votes',
            data: [10, 20, 30],
            backgroundColor: [
                'rgba(255,99,132,.8)',
                'rgba(54,162,235,.8)',
                'rgba(255,206,86,.8)'
            ]
        }]
    }, {
        responsive: true,
        plugins: {
            legend: { position: 'top' }
        }
    });

});
