let currentChart = null;
let currentRoom = null;

const roomToLocationMap = {
    deptA: '보드',
    deptB: '보드',
    meetingA: '보드',
    meetingB: '보드'
};

const roomLabelMap = {
    deptA: '사무실 A',
    deptB: '사무실 B',
    meetingA: '회의실 A',
    meetingB: '회의실 B'
};

window.showPopup = async function (roomName, el) {
    currentRoom = roomName;
    const location = roomToLocationMap[roomName];
    const label = roomLabelMap[roomName];

    if (!location) return;

    const popup = document.getElementById('popup-panel');
    const wrapper = document.getElementById('floor-wrapper');
    const boxRect = el.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const boxCenterY = boxRect.top - wrapperRect.top + boxRect.height / 2;
    const boxX = boxRect.left - wrapperRect.left;
    const isLeft = boxX < wrapperRect.width / 2;

    popup.classList.remove("left", "right");
    popup.classList.add(isLeft ? "left" : "right");
    popup.style.top = `${boxCenterY}px`;
    popup.style.left = `${boxX + (isLeft ? -20 : el.offsetWidth + 20)}px`;
    popup.style.display = 'block';

    document.getElementById("popup-title").innerText = `📍 ${label}`;

    try {
        const res = await fetch(`http://localhost:10263/api/v1/comfort/scheduled-result`, {
            headers: {
                "Content-Type": "application/json",
                "X-USER": "test-user@aiot.com"
            },
            credentials: "include"
        });

        if (!res.ok) throw new Error("룰 엔진 API 실패");

        const ruleResults = await res.json();

        const actionWithComfortInfo = ruleResults
            .flatMap(r => r.executedActions || [])
            .find(a => a.output && a.output.comfortInfo && a.output.comfortInfo.location === location);

        if (!actionWithComfortInfo) throw new Error("comfortInfo 없음");

        const comfort = actionWithComfortInfo.output.comfortInfo;

        const temperature = parseFloat(comfort.temperature);
        const humidity = parseFloat(comfort.humidity);
        const co2 = parseFloat(comfort.co2);
        const comfortIndex = comfort.comfort_index;
        const co2Comment = comfort.co2_comment;

        const data = { temperature, humidity, co2, comfortIndex, co2Comment };

        updateGradeDisplay(roomName, comfortIndex); // ✅ 쾌적도 표시
        renderChart(data);
        renderComfortTable(data);
        renderSensorStatus(actionWithComfortInfo.output.deviceCommands);

    } catch (err) {
        console.error(err);
        document.getElementById('popup-table').innerHTML = "<p>❌ 환경 데이터 오류</p>";
        document.getElementById('device-status').innerHTML = "<p>❌ 상태 불러오기 실패</p>";
    }
};

function updateGradeDisplay(roomName, comfortIndex) {
    const gradeElement = document.getElementById(`grade-${roomName}`);
    if (!gradeElement) return;

    gradeElement.className = 'grade';
    gradeElement.innerText = comfortIndex; // 예: "덥고 습함"
}

function renderChart({ temperature, humidity, co2 }) {
    const ctx = document.getElementById("popupChart");
    if (currentChart) currentChart.destroy();

    currentChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["온도 (℃)", "습도 (%)", "CO₂ (ppm)"],
            datasets: [{
                data: [temperature, humidity, co2],
                backgroundColor: ["#ff6384", "#36a2eb", "#4bc0c0"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => `${context.parsed.y} ${getUnit(context.dataIndex)}`
                    }
                }
            },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function renderComfortTable({ temperature, humidity, co2, comfortIndex, co2Comment }) {
    document.getElementById("popup-table").innerHTML = `
        <table>
            <tr><th>온도</th><td>${temperature.toFixed(1)} ℃</td></tr>
            <tr><th>습도</th><td>${humidity.toFixed(1)} %</td></tr>
            <tr><th>CO₂</th><td>${co2} ppm</td></tr>
            <tr><th>쾌적도</th><td>${comfortIndex}</td></tr>
            <tr><th>CO₂ 상태</th><td>${co2Comment}</td></tr>
        </table>
    `;
}

function renderSensorStatus(deviceCommands) {
    const map = {
        aircon: "에어컨",
        heater: "히터",
        ventilator: "환풍기",
        dehumidifier: "제습기"
    };

    const html = Object.entries(deviceCommands).map(([type, state]) => `
        <div class="device-row">
            <span>${map[type] || type}</span>
            <span class="${state ? 'on' : 'off'}">${state ? 'ON' : 'OFF'}</span>
        </div>
    `).join("");

    document.getElementById("device-status").innerHTML = `
        <h6>작동 상태</h6>
        ${html}
    `;
}

function closePopup() {
    document.getElementById("popup-panel").style.display = "none";
    currentRoom = null;
}

function getUnit(index) {
    return index === 0 ? "℃" : index === 1 ? "%" : "ppm";
}

window.addEventListener("resize", () => {
    if (currentRoom) {
        const el = document.querySelector(`[onclick*="${currentRoom}"]`);
        if (el) showPopup(currentRoom, el);
    }
});
