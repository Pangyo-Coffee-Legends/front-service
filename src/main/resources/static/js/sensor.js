const SENSOR_API = "http://localhost:10251/api/v1/sensors";
const USER_HEADER = { "X-USER": "phh@example.com" };// 101 권한 필요함
const FETCH_CONFIG = {
    headers: {
        "Content-Type": "application/json",
        ...USER_HEADER
    },
    credentials: "include"
};

document.addEventListener("DOMContentLoaded", () => {
    const defaultLocation = "회의실";
    loadSensorsByLocation(defaultLocation);

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
    const formattedData = sensorList.map(sensor => ({
        sensorNo: sensor.sensorNo,
        sensorName: sensor.sensorName,
        sensorType: sensor.sensorType,
        status: sensor.sensorStatus
            ? `<span style="color:lightgreen;font-weight:bold">ON</span>`
            : `<span style="color:gray;font-weight:bold">OFF</span>`,
        location: sensor.location,
        ruleResults: "-"
    }));

    if ($.fn.DataTable.isDataTable('#sensorResultTable')) {
        $('#sensorResultTable').DataTable().clear().rows.add(formattedData).draw();
    } else {
        $('#sensorResultTable').DataTable({
            data: formattedData,
            columns: [
                { data: 'sensorName' },
                { data: 'sensorType' },
                { data: 'status' },
                { data: 'location' },
                { data: 'ruleResults' }
            ],
            destroy: true,
            responsive: true
        });
    }
}
