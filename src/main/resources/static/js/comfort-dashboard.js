const COMFORT_API = "http://localhost:10251/api/v1/comfort/scheduled-result";
const USER_HEADER = { "X-USER": "admin@aiot.com" };

const FETCH_CONFIG = {
    headers: {
        "Content-Type": "application/json",
        ...USER_HEADER
    },
    credentials: "include"
};

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

    positionPopup(el, label);

    try {
        const res = await fetch(COMFORT_API, FETCH_CONFIG);
        if (!res.ok) throw new Error(`룰 엔진 API 실패 (${res.status})`);

        const text = await res.text();
        const ruleResults = text ? JSON.parse(text) : [];

        console.log("[디버그] 전체 ruleResults:", ruleResults);

        const comfortData = extractComfortInfo(ruleResults, location);
        console.log('comfortData', comfortData);
        if (!comfortData) throw new Error("comfortInfo 없음");

        updateGradeDisplay(roomName, comfortData.comfortIndex);
        renderChart(comfortData);
        renderComfortTable(comfortData);
        renderSensorStatus(comfortData.deviceCommands);

    } catch (err) {
        console.error(err);
        document.getElementById('popup-table').innerHTML = "<p>❌ 환경 데이터 오류</p>";
        document.getElementById('device-status').innerHTML = "<p>❌ 상태 불러오기 실패</p>";
    }
};

function extractComfortInfo(results, location) {
    console.log('results', results);
    for (const rule of results) {
        for (const action of rule.executedActions || []) {
            const output = action.output;
            const comfortInfo = output?.comfortInfo;
            const deviceCommands = output?.deviceCommands;

            if (comfortInfo?.location?.includes(location)) {
                return {
                    temperature: parseFloat(comfortInfo.temperature),
                    humidity: parseFloat(comfortInfo.humidity),
                    co2: parseFloat(comfortInfo.co2),
                    comfortIndex: comfortInfo.comfort_index,
                    co2Comment: comfortInfo.co2_comment,
                    deviceCommands: {
                        aircon: deviceCommands?.aircon ?? false,
                        ventilator: deviceCommands?.ventilator ?? false,
                        dehumidifier: deviceCommands?.dehumidifier ?? false,
                        heater: deviceCommands?.heater ?? false
                    }
                };
            }
        }
    }
    console.warn(`[디버그] 매칭되는 output 없음 for location: ${location}`);
    return null;
}

function positionPopup(el, label) {
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
}

function updateGradeDisplay(roomName, comfortIndex) {
    const gradeEl = document.getElementById(`grade-${roomName}`);
    if (gradeEl) {
        gradeEl.className = 'grade';
        gradeEl.innerText = comfortIndex;
    }
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
                        label: ctx => `${ctx.parsed.y} ${getUnit(ctx.dataIndex)}`
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
            <span class="${state ? 'on' : 'off'}">
                ${state ? 'ON' : 'OFF'}
            </span>
        </div>
    `).join("");
    document.getElementById("device-status").innerHTML = `
        <h6>작동 상태</h6>
        ${html}
    `;
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

function closePopup() {
    document.getElementById('popup-panel').style.display = "none";
    currentRoom = null;
}
