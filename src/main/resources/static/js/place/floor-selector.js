// 리스트 갱신 및 hidden input 동기화
function loadFloorList(defaultFloorNo = null) {
    fetch(`${API_BASE_URL}/api/v1/floors`, FETCH_CONFIG)
        .then(res => res.json())
        .then(floors => {
            const select = document.getElementById("floor-select");
            select.innerHTML = "";
            floors.forEach(floor => {
                const option = document.createElement("option");
                option.value = floor.floorNo;
                option.textContent = floor.floorName;
                select.appendChild(option);
            });
            // 기본값 선택
            if (defaultFloorNo && floors.some(f => f.floorNo === defaultFloorNo)) {
                select.value = defaultFloorNo;
            } else {
                select.selectedIndex = 0;
            }
            // hidden input 동기화
            document.querySelector("#floor-edit-form input[name='floorNo']").value = select.value;
            // 기본값 이미지 로딩
            loadFloorDetail(select.value);
        });
}

function loadFloorDetail(floorNo) {
    if (!floorNo) return;
    fetch(`${API_BASE_URL}/api/v1/floors/${floorNo}`, FETCH_CONFIG)
        .then(res => res.json())
        .then(floor => {
            // 이미지 경로 인코딩 (한글/특수문자 대응)
            const imagePath = floor.imagePath
                ? floor.imagePath
                    .split('/')
                    .map((part, idx, arr) => idx === arr.length - 1 ? encodeURIComponent(part) : part)
                    .join('/')
                : '';
            document.getElementById("floor-image").src = imagePath
                ? `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
                : '';
        })
        .catch(err => {
            document.getElementById("floor-image").src = "";
            console.error("층 정보 불러오기 실패", err);
        });
}

document.addEventListener("DOMContentLoaded", function() {
    loadFloorList();
    document.getElementById("floor-select").addEventListener("change", function() {
        loadFloorDetail(this.value);
    });
});

document.getElementById("floor-select").addEventListener("change", function() {
    const selectedFloorNo = this.value;
    document.querySelector("#floor-edit-form input[name='floorNo']").value = selectedFloorNo;
    loadFloorDetail(selectedFloorNo);
});

// 등록(생성)
document.getElementById("floor-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const floor = { floorName: formData.get("floorName") };
    formData.set("floor", new Blob([JSON.stringify(floor)], { type: "application/json" }));
    fetch(`${API_BASE_URL}/api/v1/floors`, { method: "POST", body: formData })
        .then(res => res.json())
        .then(data => {
            alert("층이 등록되었습니다!");
            loadFloorList();
        })
        .catch(err => alert("등록 실패"));
});

// 수정
document.getElementById("floor-edit-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const floorNo = formData.get("floorNo");
    const floor = { floorName: formData.get("floorName") };
    formData.set("floor", new Blob([JSON.stringify(floor)], { type: "application/json" }));
    fetch(`${API_BASE_URL}/api/v1/floors/${floorNo}`, { method: "PUT", body: formData })
        .then(res => res.json())
        .then(data => alert("층이 수정되었습니다!"))
        .catch(err => alert("수정 실패"));
});

// 삭제
document.getElementById('delete-floor-btn').addEventListener('click', function() {
    const select = document.getElementById('floor-select');
    const floorNo = select.value;
    if (!floorNo) {
        alert('삭제할 층을 선택하세요.');
        return;
    }
    if (!confirm(`${select.options[select.selectedIndex].text} 층을 삭제하시겠습니까?`)) {
        return;
    }
    fetch(`${API_BASE_URL}/api/v1/floors/${floorNo}`, {
        method: 'DELETE',
        credentials: 'include'
    })
        .then(res => {
            if (res.ok) {
                alert('층이 삭제되었습니다.');
                loadFloorList();
                document.getElementById("floor-image").src = "";
            } else {
                alert('층 삭제에 실패했습니다.');
            }
        })
        .catch(err => {
            console.error('삭제 중 오류 발생:', err);
            alert('층 삭제 중 오류가 발생했습니다.');
        });
});