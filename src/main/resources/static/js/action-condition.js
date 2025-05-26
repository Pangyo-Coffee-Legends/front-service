document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("loadingCard").style.display = "flex";

    await Promise.all([
        loadActionTable(),
        loadConditionTable()
    ]);

    document.getElementById("loadingCard").style.display = "none";
});


const ruleNoParam = new URLSearchParams(window.location.search).get("ruleNo");
let actionTable, conditionTable;

// 공통 언어 설정
function tableLang() {
    return {
        emptyTable: "데이터가 없습니다.",
        lengthMenu: "페이지당 _MENU_ 개씩 보기",
        search: "검색:",
        zeroRecords: "일치하는 항목이 없습니다.",
        info: "_START_ - _END_ / 총 _TOTAL_건",
        infoEmpty: "0건",
        paginate: {
            first: "처음",
            last: "마지막",
            next: "다음",
            previous: "이전"
        }
    };
}

// Action ----------------------------------------------------------------

function loadActionTable() {
    fetch("/api/v1/actions")
        .then(res => res.json())
        .then(data => {
            const filtered = ruleNoParam ? data.filter(d => d.ruleNo == ruleNoParam) : data;
            if (actionTable) actionTable.destroy();

            actionTable = $("#actionTable").DataTable({
                data: filtered,
                columns: [
                    { data: "ruleNo" },
                    { data: "actType" },
                    { data: "actPriority" },
                    {
                        data: null,
                        orderable: false,
                        render: data => `
                            <div class="action-buttons">
                                <button class="btn-view" onclick="viewAction(${data.actNo})">조회</button>
                                <button class="btn-edit" onclick="editAction(${data.actNo}, this)">수정</button>
                                <button class="btn-delete" onclick="deleteAction(${data.actNo})">삭제</button>
                            </div>
                        `
                    }
                ],
                destroy: true,
                language: tableLang()
            });
        });
}

function addNewActionRow() {
    const ruleNo = ruleNoParam || "";
    const newRow = actionTable.row.add({
        ruleNo: `<input type="number" id="newActRule" value="${ruleNo}" placeholder="Rule No">`,
        actType: `<input type="text" id="newActType" placeholder="Type">`,
        actPriority: `<input type="number" id="newActPriority" placeholder="Priority">`,
        dummy: ""
    }).draw().node();

    $(newRow).find("td:last").html(`
        <div class="action-buttons">
            <button class="btn-edit" onclick="saveNewAction(this)">저장</button>
            <button class="btn-delete" onclick="cancelNewAction(this)">취소</button>
        </div>
    `);
}

function saveNewAction(btn) {
    const row = $(btn).closest("tr");
    const ruleNo = row.find("#newActRule").val();
    const actType = row.find("#newActType").val();
    const actPriority = row.find("#newActPriority").val();

    if (!ruleNo || !actType || !actPriority) return alert("모든 필드를 입력하세요");

    const payload = {
        ruleNo: parseInt(ruleNo),
        actType,
        actParam: "{}", // ✅ 필수 항목 추가
        actPriority: parseInt(actPriority)
    };

    fetch("/api/v1/actions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-USER": "test-user@aiot.com"
        },
        body: JSON.stringify(payload)
    }).then(res => {
        if (res.ok) {
            alert("등록 성공!");
            loadActionTable();
        } else {
            res.text().then(msg => alert("등록 실패: " + msg));
        }
    });
}

function cancelNewAction(btn) {
    actionTable.row($(btn).closest("tr")).remove().draw();
}

function editAction(id, btn) {
    const row = $(btn).closest("tr");
    const cells = row.find("td");
    const type = cells.eq(1).text();
    const priority = cells.eq(2).text();

    cells.eq(1).html(`<input type="text" id="editActType" value="${type}">`);
    cells.eq(2).html(`<input type="number" id="editActPriority" value="${priority}">`);
    cells.eq(3).html(`
        <div class="action-buttons">
            <button class="btn-edit" onclick="saveEditAction(${id}, this)">저장</button>
            <button class="btn-delete" onclick="loadActionTable()">취소</button>
        </div>
    `);
}

function saveEditAction(id, btn) {
    const row = $(btn).closest("tr");
    const actType = row.find("#editActType").val();
    const actPriority = row.find("#editActPriority").val();

    const payload = {
        actType,
        actParam: "{}", // ✅ 수정 시에도 포함
        actPriority: parseInt(actPriority)
    };

    fetch(`/api/v1/actions/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-USER": "test-user@aiot.com"
        },
        body: JSON.stringify(payload)
    }).then(res => {
        if (res.ok) {
            alert("수정 성공!");
            loadActionTable();
        } else {
            res.text().then(msg => alert("수정 실패: " + msg));
        }
    });
}

function deleteAction(id) {
    if (!confirm(`Action [${id}]을 삭제할까요?`)) return;
    fetch(`/api/v1/actions/${id}`, {
        method: "DELETE",
        headers: { "X-USER": "test-user@aiot.com" }
    }).then(res => {
        if (res.ok) {
            alert("삭제 성공!");
            loadActionTable();
        } else alert("삭제 실패");
    });
}

function viewAction(id) {
    alert(`Action [${id}] 조회`);
}

// ✅ Condition --------------------------------------------------------------

function loadConditionTable() {
    fetch("/api/v1/conditions")
        .then(res => res.json())
        .then(data => {
            const filtered = ruleNoParam ? data.filter(d => d.ruleNo == ruleNoParam) : data;
            if (conditionTable) conditionTable.destroy();

            conditionTable = $("#conditionTable").DataTable({
                data: filtered,
                columns: [
                    { data: "ruleNo" },
                    { data: "conType" },
                    { data: "conField" },
                    { data: "conValue" },
                    { data: "conPriority" },
                    {
                        data: null,
                        orderable: false,
                        render: data => `
                            <div class="action-buttons">
                                <button class="btn-view" onclick="viewCondition(${data.conNo})">조회</button>
                                <button class="btn-edit" onclick="editCondition(${data.conNo}, this)">수정</button>
                                <button class="btn-delete" onclick="deleteCondition(${data.conNo})">삭제</button>
                            </div>
                        `
                    }
                ],
                destroy: true,
                language: tableLang()
            });
        });
}

function addNewConditionRow() {
    const ruleNo = ruleNoParam || "";
    const newRow = conditionTable.row.add({
        ruleNo: `<input type="number" id="newConRule" value="${ruleNo}" placeholder="Rule No">`,
        conType: `<input type="text" id="newConType" placeholder="Type">`,
        conField: `<input type="text" id="newConField" placeholder="Field">`,
        conValue: `<input type="text" id="newConValue" placeholder="Value">`,
        conPriority: `<input type="number" id="newConPriority" placeholder="Priority">`,
        dummy: ""
    }).draw().node();

    $(newRow).find("td:last").html(`
        <div class="action-buttons">
            <button class="btn-edit" onclick="saveNewCondition(this)">저장</button>
            <button class="btn-delete" onclick="cancelNewCondition(this)">취소</button>
        </div>
    `);
}

function saveNewCondition(btn) {
    const row = $(btn).closest("tr");
    const ruleNo = row.find("#newConRule").val();
    const conType = row.find("#newConType").val();
    const conField = row.find("#newConField").val();
    const conValue = row.find("#newConValue").val();
    const conPriority = row.find("#newConPriority").val();

    if (!ruleNo || !conType || !conField || !conValue || !conPriority) return alert("모든 필드를 입력하세요");

    const payload = {
        ruleNo: parseInt(ruleNo),
        conType, conField, conValue,
        conPriority: parseInt(conPriority)
    };

    fetch("/api/v1/conditions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-USER": "test-user@aiot.com"
        },
        body: JSON.stringify(payload)
    }).then(res => {
        if (res.ok) {
            alert("등록 성공!");
            loadConditionTable();
        } else {
            res.text().then(msg => alert("등록 실패: " + msg));
        }
    });
}

function cancelNewCondition(btn) {
    conditionTable.row($(btn).closest("tr")).remove().draw();
}

function editCondition(id, btn) {
    const row = $(btn).closest("tr");
    const cells = row.find("td");
    const type = cells.eq(1).text();
    const field = cells.eq(2).text();
    const value = cells.eq(3).text();
    const priority = cells.eq(4).text();

    cells.eq(1).html(`<input type="text" id="editConType" value="${type}">`);
    cells.eq(2).html(`<input type="text" id="editConField" value="${field}">`);
    cells.eq(3).html(`<input type="text" id="editConValue" value="${value}">`);
    cells.eq(4).html(`<input type="number" id="editConPriority" value="${priority}">`);
    cells.eq(5).html(`
        <div class="action-buttons">
            <button class="btn-edit" onclick="saveEditCondition(${id}, this)">저장</button>
            <button class="btn-delete" onclick="loadConditionTable()">취소</button>
        </div>
    `);
}

function saveEditCondition(id, btn) {
    const row = $(btn).closest("tr");
    const conType = row.find("#editConType").val();
    const conField = row.find("#editConField").val();
    const conValue = row.find("#editConValue").val();
    const conPriority = row.find("#editConPriority").val();

    const payload = {
        conType, conField, conValue,
        conPriority: parseInt(conPriority)
    };

    fetch(`/api/v1/conditions/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-USER": "test-user@aiot.com"
        },
        body: JSON.stringify(payload)
    }).then(res => {
        if (res.ok) {
            alert("수정 성공!");
            loadConditionTable();
        } else {
            res.text().then(msg => alert("수정 실패: " + msg));
        }
    });
}

function deleteCondition(id) {
    if (!confirm(`Condition [${id}]을 삭제할까요?`)) return;
    fetch(`/api/v1/conditions/${id}`, {
        method: "DELETE",
        headers: { "X-USER": "test-user@aiot.com" }
    }).then(res => {
        if (res.ok) {
            alert("삭제 성공!");
            loadConditionTable();
        } else alert("삭제 실패");
    });
}

function viewCondition(id) {
    alert(`Condition [${id}] 조회`);
}
