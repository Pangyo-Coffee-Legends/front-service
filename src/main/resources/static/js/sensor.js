document.addEventListener("DOMContentLoaded", () => {
    fetchAllSensors(); // 전체 센서 목록 초기 로드

    // ➕ 새 기기 추가 버튼 클릭 시 모달 열기
    document.getElementById("addDeviceBtn").addEventListener("click", () => {
        document.getElementById("addDeviceModal").style.display = "block";
    });

    // ✅ 등록 폼 제출 시 센서 등록 처리
    document.getElementById("deviceForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const sensor = {
            sensorName: formData.get("sensorName"),
            sensorType: formData.get("sensorType"),
            location: formData.get("location"),
            roleNo: 101,           // 관리자 권한
            sensorStatus: false    // 기본 상태
        };

        fetch("/api/v1/sensors", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(sensor)
        })
            .then(res => {
                if (!res.ok) {
                    return res.text().then(text => {
                        throw new Error(`기기 추가 실패: ${text}`);
                    });
                }
                return res.json();
            })
            .then(() => {
                alert("기기가 성공적으로 추가되었습니다.");
                closeModal();
                fetchAllSensors(); // 등록 후 테이블 새로고침
            })
            .catch(err => {
                console.error("기기 추가 오류:", err);
                alert("기기 추가 중 오류가 발생했습니다.");
            });
    });
});

// ❌ 모달 닫기 함수
function closeModal() {
    document.getElementById("addDeviceModal").style.display = "none";
}

// ✅ 전체 센서 데이터 불러오기 및 테이블 렌더링
function fetchAllSensors() {
    fetch("/api/v1/sensors", {
        credentials: "include"
    })
        .then(res => res.json())
        .then(sensorList => {
            console.log("응답 데이터:", sensorList); // 디버깅용

            const dataArray = Array.isArray(sensorList) ? sensorList : sensorList.body;

            if (!Array.isArray(dataArray)) {
                throw new Error("서버에서 받은 센서 데이터 형식이 잘못되었습니다.");
            }

            // ✅ 장소 select 옵션 동적 업데이트
            updateLocationSelect(dataArray);

            const tableData = dataArray.map(sensor => ({
                sensorNo: sensor.sensorNo,
                sensorName: sensor.sensorName,
                sensorType: sensor.sensorType,
                location: sensor.location,
                status: sensor.sensorStatus === true
                    ? '<span style="color:lightgreen;font-weight:bold">ON</span>'
                    : '<span style="color:gray;font-weight:bold">OFF</span>',
                ruleResults: sensor.ruleResults?.map(rule =>
                    `<div class="rule-result">
                        ${rule.ruleName} :
                        ${rule.result
                        ? '<span class="rule-ok">적용됨 ✅</span>'
                        : '<span class="rule-fail">미적용 ❌</span>'}
                    </div>`).join("") || "-"
            }));

            $('#sensorResultTable').DataTable({
                data: tableData,
                columns: [
                    { data: 'sensorNo' },
                    { data: 'sensorName' },
                    { data: 'sensorType' },
                    { data: 'status' },
                    { data: 'location' },
                    { data: 'ruleResults' }
                ],
                destroy: true,
                responsive: true
            });
        })
        .catch(err => {
            console.error("전체 센서 조회 실패:", err);
            alert("센서 목록을 불러오는 데 실패했습니다.");
        });
}

// ✅ 센서 목록을 기반으로 장소 select 동적 구성
function updateLocationSelect(sensorList) {
    const locationSet = new Set(sensorList.map(sensor => sensor.location).filter(Boolean));
    const locationSelect = document.getElementById("locationSelect");

    // 기존 옵션 초기화
    locationSelect.innerHTML = "";

    // 기본 "선택" 옵션 추가
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "장소 선택";
    locationSelect.appendChild(defaultOption);

    // 고유 장소 추가
    locationSet.forEach(location => {
        const option = document.createElement("option");
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
    });
}
