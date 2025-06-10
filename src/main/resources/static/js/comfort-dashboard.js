const COMFORT_API = "https://aiot2.live/api/v1/comfort/scheduled-result";

const BASE_API="https://aiot2.live";
const WEATHER_API = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst";
const SERVICE_KEY = "%2Be2VrgCSeuZBQLw%2Fh7%2BHTNOR6VRLMm3UNzeh%2Fp2YITaCzXl11XX5sYxUMIN4JNpl5pVtB5hhDR%2BpM%2FrDAEKkqA%3D%3D";
const KAKAO_REST_KEY = "bda024433062fa6d4ddf9046e523d4c0";

let currentRoom = null;
let currentCoords = null;
let currentAddress = null;

const FETCH_CONFIG = {
    headers: {
        "Content-Type": "application/json"
    },
    credentials: "include"
};

const roomToLocationMap = {
    deptA: '보드',
    deptB: '보드',
    meetingA: '보드',
    meetingB: '보드'
};

const roomLabelMap = {
    deptA: '사무실A',
    deptB: '사무실B',
    meetingA: '회의실A',
    meetingB: '회의실B'
};


const placeToggleTitle = document.querySelector(".title-toggle");
const placeBody = document.getElementById("place-manage-body");
const icon = document.getElementById("place-manage-icon");

placeToggleTitle.addEventListener("click", () => {
    const isOpen = placeBody.style.display !== "none";
    placeBody.style.display = isOpen ? "none" : "block";
    icon.className = isOpen ? "triangle triangle-down" : "triangle triangle-up";
});

// ✅ 처음부터 감춰진 상태로 시작
placeBody.style.display = "none";
icon.className = "triangle triangle-down";

document.addEventListener('DOMContentLoaded', function() {
    // 장소 목록 불러오기
    fetch(BASE_API + '/api/v1/floors')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('place-select-dropdown');
            select.innerHTML = '<option value="">장소 선택</option>';
            data.forEach(floor => {
                const option = document.createElement('option');
                option.value = floor.floorNo;
                option.textContent = floor.floorName;
                select.appendChild(option);
            });
        });
});

document.getElementById('place-select-dropdown').addEventListener('change', function() {
    const floorNo = this.value;

    const placeNameInput = document.getElementById('place-name-input');
    const floorImage = document.getElementById('floor-image');

    if (!floorNo) {
        placeNameInput.value = '';
        floorImage.src = "/images/academy.png";
        return;
    }

    fetch(`${BASE_API}/api/v1/floors/${floorNo}`)
        .then(res => {
            if (!res.ok) throw new Error('조회 실패: ' + res.status);
            return res.json();
        })
        .then(data => {
            document.getElementById('place-name-input').value = data.floorName || '';

            const imgSrc = data.imagePath.startsWith('http')
                ? data.imagePath
                : `https://s2.java21.net${data.imagePath}`;

            document.getElementById('floor-image').src = imgSrc || "/images/academy.png";
        })
        .catch(err => {
            console.error('조회 에러:', err);
            placeNameInput.value = '';
            floorImage.src = "/images/academy.png";
        });
});

// 등록
document.getElementById('btn-register-place').addEventListener('click', function() {
    const formData = new FormData();
    formData.append('place', JSON.stringify({
        floorName: document.getElementById('place-name-input').value
    }));
    const fileInput = document.getElementById('place-image-input');
    if (fileInput.files[0]) formData.append('file', fileInput.files[0]);

    fetch(BASE_API + '/api/v1/floors', {
        method: 'POST',
        body: formData
    })
        .then(res => {
            console.log(res); // 응답 상태 확인
            if (!res.ok) throw new Error('서버 응답 오류');
            return res.json();
        })
        .then(data => {
            console.log(data); // 서버 응답 데이터 확인
            alert('등록 성공');
            location.reload();
        })
        .catch(err => {
            console.error(err); // 에러 발생 시 확인
            alert('등록 실패: ' + err.message);
        });
});


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-update-place")?.addEventListener("click", async () => {
        const floorNo = document.getElementById("place-select-dropdown").value;
        const placeName = document.getElementById("place-name-input").value.trim();
        const fileInput = document.getElementById("place-image-input");

        if (!floorNo || !placeName) {
            alert("장소명과 장소를 모두 선택해야 합니다.");
            return;
        }

        const jsonPayload = {
            floorName: placeName,
            imagePath: ""
        };

        const formData = new FormData();
        formData.append(
            "place",
            new Blob([JSON.stringify(jsonPayload)], { type: "application/json" })
        );

        if (fileInput.files.length > 0) {
            formData.append("file", fileInput.files[0]);
        }

        try {
            const res = await fetch(BASE_API + `/api/v1/floors/${floorNo}`, {
                method: "PUT",
                body: formData
            });

            if (!res.ok) throw new Error(`수정 실패: ${res.status}`);
            const data = await res.json();

            alert("수정 성공");
            location.reload();
        } catch (err) {
            console.error("수정 에러:", err);
            alert("수정 실패: " + err.message);
        }
    });
});

document.getElementById('btn-delete-place').addEventListener('click', function() {
    const floorNo = document.getElementById('place-select-dropdown').value;
    if (!floorNo) {
        alert('장소를 선택하세요.');
        return;
    }
    if (!confirm('정말 삭제하시겠습니까?')) return;

    fetch(`${BASE_API}/api/v1/floors/${floorNo}`, {
        method: 'DELETE'
    })
        .then(res => {
            if (!res.ok) throw new Error('삭제 실패: ' + res.status);

            // 🔽 본문이 있으면 파싱하고, 없으면 그냥 빈 객체 반환
            return res.text().then(text => text ? JSON.parse(text) : {});
        })
        .then(() => {
            alert('삭제 성공');
            location.reload(); // 목록 갱신
        })
        .catch(err => {
            console.error('삭제 에러:', err);
            alert('삭제 실패: ' + err.message);
        });
});
window.showPopup = async function (roomName) {
    currentRoom = roomName;
    const location = roomToLocationMap[roomName];
    const label = roomLabelMap[roomName];
    if (!location) return;

    document.querySelectorAll('.info-box').forEach(box => box.classList.remove('selected'));
    const selectedBox = document.querySelector(`[onclick*="${roomName}"]`);
    if (selectedBox) selectedBox.classList.add('selected');

    document.getElementById("popup-title").innerText = label;

    if (roomName === "deptA") {
        try {
            const res = await fetch(COMFORT_API, FETCH_CONFIG);
            const text = await res.text();
            const ruleResults = text ? JSON.parse(text) : [];

            const comfortData = extractComfortInfo(ruleResults, location);
            if (!comfortData) throw new Error("comfortInfo 없음");

            updateGradeDisplay(roomName, comfortData.comfortIndex);
            renderComfortTable(comfortData);
            renderSensorStatus(comfortData.deviceCommands);
        } catch (err) {
            console.error(err);
            ["env-temp", "env-humi", "env-co2", "env-index", "env-comment"].forEach(id => {
                document.getElementById(id).innerText = "-";
            });
            document.getElementById("device-status").innerHTML = `
                <h5>작동 상태</h5>
                <p>❌ 상태 불러오기 실패</p>
            `;
        }
    } else {
        // 랜덤 더미 데이터
        const comfortData = generateRandomData(roomName);

        updateGradeDisplay(roomName, comfortData.comfortIndex);
        renderComfortTable(comfortData);
        renderSensorStatus(comfortData.deviceCommands);
    }
}

async function fetchComfortData(roomName) {
    const location = roomToLocationMap[roomName];
    if (!location) return;

    try {
        const res = await fetch(COMFORT_API, FETCH_CONFIG);
        const text = await res.text();
        const ruleResults = text ? JSON.parse(text) : [];

        const comfortData = extractComfortInfo(ruleResults, location);
        if (!comfortData) return;

        updateGradeDisplay(roomName, comfortData.comfortIndex);
    } catch (err) {
        console.error(`[${roomName}] comfort 로딩 실패`, err);
    }
}

function extractComfortInfo(results, location) {
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
    return null;
}

function updateGradeDisplay(roomName, comfortIndex) {
    const gradeEl = document.getElementById(`grade-${roomName}`);
    const boxEl = document.querySelector(`[onclick*="${roomName}"]`);
    const popupPanel = document.getElementById("popup-panel");

    if (!gradeEl || !boxEl || !popupPanel) return;

    gradeEl.className = 'grade';
    boxEl.classList.remove("green", "red", "blue", "gray");
    popupPanel.classList.remove("green", "red", "blue", "gray");

    if (comfortIndex === "더미") {
        gradeEl.innerText = "⚪";
        boxEl.classList.add("gray");
        return;
    }

    if (comfortIndex.includes("최적")) {
        gradeEl.innerText = "🟢";
        boxEl.classList.add("green");
        popupPanel.classList.add("green");
    } else if (comfortIndex.includes("덥고")) {
        gradeEl.innerText = "🔴";
        boxEl.classList.add("red");
        popupPanel.classList.add("red");
    } else if (comfortIndex.includes("춥고")) {
        gradeEl.innerText = "🔵";
        boxEl.classList.add("blue");
        popupPanel.classList.add("blue");
    } else {
        gradeEl.innerText = "-";
        boxEl.classList.add("gray");
        popupPanel.classList.add("gray");
    }
}

function renderComfortTable({ temperature, humidity, co2, comfortIndex, co2Comment }) {
    document.getElementById("env-temp").innerText = `${temperature.toFixed(1)} ℃`;
    document.getElementById("env-humi").innerText = `${humidity.toFixed(1)} %`;
    document.getElementById("env-co2").innerText = `${co2} ppm`;
    document.getElementById("env-index").innerText = comfortIndex;
    document.getElementById("env-comment").innerText = co2Comment;
}

function renderSensorStatus(deviceCommands) {
    const map = {
        aircon: "에어컨",
        heater: "히터",
        ventilator: "환풍기",
        dehumidifier: "제습기"
    };
    const html = Object.entries(deviceCommands).map(([type, state]) => `
        <div class="data-row">
            <span>${map[type] || type}</span>
            <span class="${state ? 'on' : 'off'}">${state ? 'ON' : 'OFF'}</span>
        </div>
    `).join("");
    document.getElementById("device-status").innerHTML = `
        <h5>작동 상태</h5>
        ${html}
    `;
}

function convertToGrid(lat, lng) {
    const RE = 6371.00877;
    const GRID = 5.0;
    const SLAT1 = 30.0, SLAT2 = 60.0;
    const OLON = 126.0, OLAT = 38.0;
    const XO = 43, YO = 136;

    const DEGRAD = Math.PI / 180.0;
    const re = RE / GRID;
    const slat1 = SLAT1 * DEGRAD;
    const slat2 = SLAT2 * DEGRAD;
    const olon = OLON * DEGRAD;
    const olat = OLAT * DEGRAD;

    let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);

    let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
    sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;

    let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
    ro = re * sf / Math.pow(ro, sn);

    let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
    ra = re * sf / Math.pow(ra, sn);

    let theta = lng * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;

    return {
        x: Math.floor(ra * Math.sin(theta) + XO + 0.5),
        y: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5)
    };
}

async function updateCoordsByLocation(locationName) {
    try {
        const res = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(locationName)}`, {
            headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` }
        });
        const json = await res.json();
        const doc = json.documents[0];
        if (!doc) throw new Error("위치 검색 실패");

        currentAddress = doc.address_name;
        const lat = parseFloat(doc.y);
        const lng = parseFloat(doc.x);
        currentCoords = convertToGrid(lat, lng);

        fetchWeather();
    } catch (e) {
        console.error("좌표 변환 실패", e);
    }
}

function getAdjustedBaseDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - 40);
    const baseDate = now.toISOString().slice(0, 10).replace(/-/g, '');
    const baseHour = now.getHours().toString().padStart(2, '0') + "30";
    return { baseDate, baseTime: baseHour };
}

async function fetchWeather() {
    const { baseDate, baseTime } = getAdjustedBaseDateTime();
    const url = `${WEATHER_API}?serviceKey=${SERVICE_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${currentCoords.x}&ny=${currentCoords.y}`;

    try {
        const res = await fetch(url);
        const json = await res.json();
        const items = json?.response?.body?.items?.item || [];

        const weatherData = { T1H: "-", REH: "-", WSD: "-", SKY: "-", PTY: "0" };
        for (const item of items) {
            if (weatherData.hasOwnProperty(item.category)) {
                weatherData[item.category] = item.fcstValue;
            }
            if (item.category === "PTY") {
                weatherData.PTY = item.fcstValue;
            }
        }

        document.getElementById("weather-location-label").innerText = currentAddress;
        document.getElementById("weather-temp").innerText = `${weatherData.T1H} ℃`;
        document.getElementById("weather-humi").innerText = `${weatherData.REH} %`;
        document.getElementById("weather-wind").innerText = `${weatherData.WSD} m/s`;
        document.getElementById("weather-desc").innerText = getWeatherIcon(weatherData.SKY, weatherData.PTY);
    } catch (e) {
        console.error("날씨 API 오류", e);
    }
}

function getWeatherIcon(sky, pty) {
    if (pty === "1") return "🌧️ 비";
    if (pty === "2") return "🌨️ 비/눈";
    if (pty === "3") return "❄️ 눈";
    if (pty === "4") return "🌦️ 소나기";

    switch (sky) {
        case "1": return "☀️ 맑음";
        case "3": return "⛅ 구름많음";
        case "4": return "☁️ 흐림";
        default: return "-";
    }
}

window.addEventListener("DOMContentLoaded", () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        currentCoords = convertToGrid(lat, lng);

        try {
            const res = await fetch(`https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`, {
                headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` }
            });
            const json = await res.json();
            const doc = json.documents[0];
            currentAddress = doc
                ?.address?.address_name || "현재 위치";
        } catch {
            currentAddress = "현재 위치";
        }

        fetchWeather();
    });

    const input = document.getElementById("location-input");
    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const query = input.value.trim();
                if (query) updateCoordsByLocation(query);
            }
        });
    }

    // 이 부분 추가: 최초 로딩 시 'deptA' 자동 선택
    showPopup("deptA");

    // 나머지 쾌적도 데이터도 병렬로 로드
    ["deptA", "deptB", "meetingA", "meetingB"].forEach(fetchComfortData);
});
