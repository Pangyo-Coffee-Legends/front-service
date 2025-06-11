const SENSOR_API = "https://aiot2.live/api/v1/sensors";
// const SENSOR_API = "http://localhost:10251/api/v1/sensors";
const USER_HEADER = { "X-USER": "test-user@aiot.com" }; // ✅ 추가

const FETCH_CONFIG = {
    headers: {
        "Content-Type": "application/json",
        ...USER_HEADER
    },
    credentials: "include"
};

function fillLocationSelects(locations) {
    // 조회용 드롭다운
    const filterSelect = document.getElementById("filterLocationSelect");
    filterSelect.innerHTML = "";
    locations.forEach(loc => {
        const option = document.createElement("option");
        option.value = loc;
        option.textContent = loc;
        filterSelect.appendChild(option);
    });

    // 모달 내 장소 드롭다운
    const modalSelect = document.getElementById("modalLocationSelect");
    modalSelect.innerHTML = "";
    locations.forEach(loc => {
        const option = document.createElement("option");
        option.value = loc;
        option.textContent = loc;
        modalSelect.appendChild(option);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fetch("https://aiot2.live/api/v1/sensors/places", FETCH_CONFIG)
    // fetch("http://localhost:10251/api/v1/sensors/places", FETCH_CONFIG)
        .then(res => res.ok ? res.json() : Promise.reject("장소 목록 불러오기 실패"))
        .then(locations => {
            // ✅ 드롭다운에 데이터 채우기
            fillLocationSelects(locations);

            // ✅ 첫 번째 장소로 센서 목록 로딩
            if (locations.length > 0) {
                loadSensorsByLocation(locations[0]);
                document.getElementById("filterLocationSelect").value = locations[0];
            }
        })
        .catch(err => {
            alert("장소 목록을 불러오는 데 실패했습니다.");
            console.error(err);
        });

    document.getElementById("addDeviceBtn").addEventListener("click", () => {
        document.getElementById("addDeviceModal").style.display = "block";
    });

    document.getElementById("deviceForm").addEventListener("submit", event => {
        event.preventDefault();
        const formData = new FormData(event.target);

        const sensorType = formData.get("sensorType");
        if (!sensorType) {
            alert("센서 타입을 선택해주세요.");
            return;
        }

        const newSensor = {
            sensorName: formData.get("sensorName"),
            sensorType: sensorType, // 그대로 전송
            location: formData.get("location"),
            sensorStatus: false
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

                // 드롭다운 선택 반영 + 로딩
                const dropdown = document.getElementById("filterLocationSelect");
                dropdown.value = newSensor.location;
                dropdown.dispatchEvent(new Event("change"));
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
        tableEl.DataTable().clear().destroy();
    }

    tableEl.DataTable({
        data: formattedData,
        columns: [
            { data: 'sensorName', title: '센서 이름' },
            { data: 'sensorType', title: '센서 타입' },
            { data: 'status', title: '센서 상태' },
            { data: 'location', title: '센서 장소' },
            { data: 'actions', title: '센서 수정', render: function (data, type, row) {
                    return `
                    <button class="edit-btn" data-id="${row.sensorNo}">수정</button>
                    <button class="delete-btn" data-id="${row.sensorNo}">삭제</button>
                `;
                }}
        ],
        destroy: true,
        responsive: true
    });

    // 수정 버튼 클릭 시 처리
    $('.edit-btn').click(function () {
        const sensorId = $(this).data('id');
        editSensor(sensorId);
    });

    // 삭제 버튼 클릭 시 처리
    $('.delete-btn').click(function () {
        const sensorId = $(this).data('id');
        deleteSensor(sensorId);
    });
}

function formatSensor(sensor) {
    return {
        sensorNo: sensor.sensorNo,
        sensorName: sensor.sensorName,
        sensorType: normalizeType(sensor.sensorType),
        status: Boolean(sensor.sensorStatus)
            ? `<span style="color:lightgreen;font-weight:bold">ON</span>`
            : `<span style="color:gray;font-weight:bold">OFF</span>`,
        location: sensor.location,
        ruleResults: "-"
    };
}

function normalizeType(type) {
    if (!type) return "";
    const lower = type.toLowerCase();
    switch (lower) {
        case "aircon": return "Aircon";
        case "heater": return "Heater";
        case "humidifier": return "Humidifier";
        case "dehumidifier": return "Dehumidifier";
        case "ventilator": return "Ventilator";
        default: return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }
}

function editSensor(sensorNo) {
    // 수정할 센서 정보를 로딩하고 모달에 채우기
    fetch(`${SENSOR_API}/${sensorNo}`, {
        ...FETCH_CONFIG
    })
        .then(res => res.ok ? res.json() : Promise.reject("수정할 센서 조회 실패"))
        .then(sensor => {
            // 예: 센서 정보를 모달에 채운 후 보여주기
            document.querySelector('input[name="sensorName"]').value = sensor.sensorName;
            document.querySelector('select[name="sensorType"]').value = sensor.sensorType;
            document.querySelector('select[name="location"]').value = sensor.location;

            // 수정 후 모달 보여주기
            document.getElementById("addDeviceModal").style.display = "block";
        })
        .catch(err => {
            console.error("센서 조회 실패:", err);
            alert("센서 정보를 불러오는 데 실패했습니다.");
        });
}

function deleteSensor(sensorNo) {
    if (confirm("정말로 이 센서를 삭제하시겠습니까?")) {
        fetch(`${SENSOR_API}/${sensorNo}`, {
            ...FETCH_CONFIG,
            method: "DELETE"
        })
            .then(res => {
                if (res.ok) {
                    // 204 No Content는 body가 없음 → 그냥 성공 처리
                    return;
                } else {
                    return res.text().then(text => { throw new Error(text || "삭제 실패"); });
                }
            })
            .then(() => {
                alert("센서가 삭제되었습니다.");
                loadSensorsByLocation(document.getElementById("filterLocationSelect").value);
            })
            .catch(err => {
                console.error("삭제 실패:", err);
                alert("센서 삭제에 실패했습니다.");
            });
    }
}
