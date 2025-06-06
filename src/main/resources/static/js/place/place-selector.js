// 리스트를 갱신할 때도 hidden input을 동기화
function loadPlaceList(defaultPlaceNo = null) {
    fetch(`${API_BASE_URL}/api/v1/places`, FETCH_CONFIG)
        .then(res => res.json())
        .then(places => {
            const select = document.getElementById("place-select");
            select.innerHTML = "";
            places.forEach(place => {
                const option = document.createElement("option");
                option.value = place.placeNo;
                option.textContent = place.placeName;
                select.appendChild(option);
            });
            // 기본값 선택
            if (defaultPlaceNo && places.some(p => p.placeNo === defaultPlaceNo)) {
                select.value = defaultPlaceNo;
            } else {
                select.selectedIndex = 0;
            }
            // hidden input도 동기화
            document.querySelector("#place-edit-form input[name='placeNo']").value = select.value;
            // 기본값 이미지 로딩
            loadPlaceDetail(select.value);
        });
}

function loadPlaceDetail(placeNo) {
    if (!placeNo) return;
    fetch(`${API_BASE_URL}/api/v1/places/${placeNo}`, FETCH_CONFIG)
        .then(res => res.json())
        .then(place => {
            // 이미지 경로 인코딩 (한글/특수문자 대응)
            const imagePath = place.imagePath
                ? place.imagePath
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
            console.error("장소 정보 불러오기 실패", err);
        });
}

document.addEventListener("DOMContentLoaded", function() {
    loadPlaceList();
    document.getElementById("place-select").addEventListener("change", function() {
        loadPlaceDetail(this.value);
    });
});

document.getElementById("place-select").addEventListener("change", function() {
    const selectedPlaceNo = this.value;
    document.querySelector("#place-edit-form input[name='placeNo']").value = selectedPlaceNo;
    loadPlaceDetail(selectedPlaceNo); // 선택된 장소 상세 정보 로딩
});

// 등록(생성)
document.getElementById("place-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const place = { placeName: formData.get("placeName") };
    formData.set("place", new Blob([JSON.stringify(place)], { type: "application/json" }));
    fetch(`${API_BASE_URL}/api/v1/places`, { method: "POST", body: formData })
        .then(res => res.json())
        .then(data => {
            alert("장소가 등록되었습니다!");
            loadPlaceList(); // 등록 후 리스트 갱신
        })
        .catch(err => alert("등록 실패"));
});

// 수정
document.getElementById("place-edit-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const placeNo = formData.get("placeNo");
    const place = { placeName: formData.get("placeName") }; // 새 장소명만 전송
    formData.set("place", new Blob([JSON.stringify(place)], { type: "application/json" }));
    fetch(`${API_BASE_URL}/api/v1/places/${placeNo}`, { method: "PUT", body: formData })
        .then(res => res.json())
        .then(data => alert("장소가 수정되었습니다!"))
        .catch(err => alert("수정 실패"));
});

// 삭제
document.getElementById('delete-place-btn').addEventListener('click', function() {
    const select = document.getElementById('place-select');
    const placeName = select.value;
    if (!placeName) {
        alert('삭제할 장소를 선택하세요.');
        return;
    }
    if (!confirm(`${placeName} 장소를 삭제하시겠습니까?`)) {
        return;
    }

    // 삭제 API 호출 (장소명을 placeNo로 바꿔야 할 수도 있음)
    fetch(`${API_BASE_URL}/api/v1/places/${encodeURIComponent(placeName)}`, {
        method: 'DELETE',
        credentials: 'include'
    })
        .then(res => {
            if (res.ok) {
                alert('장소가 삭제되었습니다.');
                loadPlaceList(); // 리스트 새로고침
                document.getElementById("floor-image").src = ""; // 이미지 영역 비우기
            } else {
                alert('장소 삭제에 실패했습니다.');
            }
        })
        .catch(err => {
            console.error('삭제 중 오류 발생:', err);
            alert('장소 삭제 중 오류가 발생했습니다.');
        });
});