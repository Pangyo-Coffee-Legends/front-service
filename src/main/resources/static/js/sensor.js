const SENSOR_API = "http://localhost:10251/api/v1/sensors";
const USER_HEADER = { "X-USER": "test-user@aiot.com" };
const FETCH_CONFIG = {
    headers: {
        "Content-Type": "application/json",
        ...USER_HEADER
    },
    credentials: "include"
};

document.addEventListener("DOMContentLoaded", () => {
    const selected = document.getElementById("filterLocationSelect").value;
    loadSensorsByLocation(selected); // ✅ 드롭다운 선택값 기준 초기 로딩

    // 🔧 오류 방지: WebSocket 연결 필요 없으면 아래 줄 삭제해도 됩니다
    // connectSensorSocket(); // ❌ 주석 처리 또는 삭제

    document.getElementById("addDeviceBtn").addEventListener("click", () => {
        document.getElementById("addDeviceModal").style.display = "block";
    });

    document.getElementById("deviceForm").addEventListener("submit", event => {
        event.preventDefault();
        const formData = new FormData(event.target);

        const newSensor = {
            sensorName: formData.get("sensorName"),
            sensorType: formData.get("sensorType").toUpperCase(),
            location: formData.get("location"),
            sensorStatus: false // 기본 OFF
        };

        fetch(SENSOR_API, {
            ...FETCH_CONFIG,
            method: "POST",
            body: JSON.stringify(newSensor)
        })
            .then(res => res.ok ? res.json() : res.text().then(text => { throw new Error(text); }))
            .then(() => {
                alert("기기 등록 완료");
                closeAddDeviceModal();
                loadSensorsByLocation(newSensor.location);
                document.getElementById("filterLocationSelect").value = newSensor.location;
            })
            .catch(err => {
                console.error("기기 등록 실패:", err);
                alert("기기 등록 실패: " + err.message);
            });
    });

    document.getElementById("filterLocationSelect").addEventListener("change", e => {
        const selected = e.target.value;
        if (selected) {
            loadSensorsByLocation(selected);
        }
    });
});

function closeAddDeviceModal() {
    document.getElementById("addDeviceModal").style.display = "none";
    document.getElementById("deviceForm").reset();
}

function loadSensorsByLocation(location) {
    const encodedLocation = encodeURIComponent(location);
    fetch(`${SENSOR_API}/place/${encodedLocation}`, {
        ...FETCH_CONFIG
    })
        .then(res => res.ok ? res.json() : Promise.reject("센서 조회 실패"))
        .then(sensorList => {
            if (!Array.isArray(sensorList)) throw new Error("데이터 형식 오류");
            renderSensorTable(sensorList);
        })
        .catch(err => {
            console.error("센서 조회 실패:", err);
            alert("센서 데이터를 불러오는 데 실패했습니다.");
        });
}

function renderSensorTable(sensorList) {
    const formattedData = sensorList.map(sensor => formatSensor(sensor));
    const tableEl = $('#sensorResultTable');

    if ($.fn.DataTable.isDataTable('#sensorResultTable')) {
        tableEl.DataTable().clear().destroy(); // ✅ 헤더는 그대로 유지하면서 초기화
    }

    tableEl.DataTable({
        data: formattedData,
        columns: [
            { data: 'sensorName', title: '센서 이름' },
            { data: 'sensorType', title: '센서 타입' },
            { data: 'status', title: '센서 상태' },
            { data: 'location', title: '센서 장소' },
            // { data: 'ruleResults', title: '룰 결과' }
        ],
        destroy: true,
        responsive: true
    });
}

function formatSensor(sensor) {
    return {
        sensorNo: sensor.sensorNo,
        sensorName: sensor.sensorName,
        sensorType: sensor.sensorType,
        status: sensor.sensorStatus
            ? `<span style="color:lightgreen;font-weight:bold">ON</span>`
            : `<span style="color:gray;font-weight:bold">OFF</span>`,
        location: sensor.location,
        ruleResults: "-"
    };
}
