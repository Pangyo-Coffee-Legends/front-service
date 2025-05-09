const comfortData = {
    deptA: {label: "부서 A", temp: 24.5, humid: 50, co2: 520, grade: "pleasant"},
    deptB: {label: "부서 B", temp: 25.8, humid: 55, co2: 630, grade: "normal"},
    meetingA: {label: "회의실 A", temp: 26.3, humid: 60, co2: 920, grade: "unpleasant"},
    meetingB: {label: "회의실 B", temp: 27.1, humid: 65, co2: 1200, grade: "unpleasant"}
};

let currentChart = null;
let currentRoom = null;

function showPopup(roomName, el) {
    const data = comfortData[roomName];
    if (!data) return;

    currentRoom = roomName;

    const popup = document.getElementById('popup-panel');
    const wrapper = document.getElementById('floor-wrapper');
    const boxRect = el.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    const boxCenterY = boxRect.top - wrapperRect.top + boxRect.height / 2;
    const boxX = boxRect.left - wrapperRect.left;
    const isLeft = boxX < wrapperRect.width / 2;

    popup.classList.remove('left', 'right');
    popup.classList.add(isLeft ? 'left' : 'right');

    popup.style.top = `${boxCenterY}px`;
    popup.style.left = `${boxX + (isLeft ? -20 : el.offsetWidth + 20)}px`;
    popup.style.display = 'block';

    document.getElementById('popup-title').innerText = `📍 ${data.label}`;

    const ctx = document.getElementById('popupChart');
    if (currentChart) currentChart.destroy();

    currentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['온도 (℃)', '습도 (%)', 'CO₂ (ppm)'],
            datasets: [{
                data: [data.temp, data.humid, data.co2],
                backgroundColor: ['#ff6384', '#36a2eb', '#4bc0c0']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {display: false},
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.parsed.y} ${getUnit(context.dataIndex)}`;
                        }
                    }
                }
            },
            scales: {
                y: {beginAtZero: true}
            }
        }
    });

    const gradeClass = data.grade === 'pleasant' ? 'pleasant' : data.grade === 'normal' ? 'normal' : 'unpleasant';
    document.getElementById('popup-table').innerHTML = `
        <table class="table table-sm table-bordered text-white mt-3">
          <tr><th>온도</th><td>${data.temp} ℃</td></tr>
          <tr><th>습도</th><td>${data.humid} %</td></tr>
          <tr><th>CO₂</th><td>${data.co2} ppm</td></tr>
          <tr><th>상태</th><td class="grade ${gradeClass}">${gradeText(data.grade)}</td></tr>
        </table>
      `;

    // IoT 제어 초기화
    setControlMode('auto');
    ['aircon', 'heater', 'dehumidifier', 'vent'].forEach(id => {
        document.getElementById(id).checked = false;
    });
}

function setControlMode(mode) {
    const isManual = mode === 'manual';

    document.getElementById('mode-auto').classList.toggle('btn-light', mode === 'auto');
    document.getElementById('mode-auto').classList.toggle('btn-outline-light', mode !== 'auto');
    document.getElementById('mode-manual').classList.toggle('btn-info', mode === 'manual');
    document.getElementById('mode-manual').classList.toggle('btn-outline-info', mode !== 'manual');

    ['aircon', 'heater', 'dehumidifier', 'vent'].forEach(id => {
        document.getElementById(id).disabled = !isManual;
    });
}

function getUnit(index) {
    return index === 0 ? '℃' : index === 1 ? '%' : 'ppm';
}

function gradeText(grade) {
    switch (grade) {
        case 'pleasant':
            return '쾌적';
        case 'normal':
            return '보통';
        case 'unpleasant':
            return '불쾌';
        default:
            return '-';
    }
}

function closePopup() {
    document.getElementById('popup-panel').style.display = 'none';
    currentRoom = null;
}

window.addEventListener('resize', () => {
    if (currentRoom) {
        const el = document.querySelector(`[onclick*="${currentRoom}"]`);
        if (el) showPopup(currentRoom, el);
    }
});