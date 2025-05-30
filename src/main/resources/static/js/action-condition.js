const ruleNoParam = new URLSearchParams(window.location.search).get("ruleNo");
let actionTable, conditionTable;
let pendingDeleteId = null;
let pendingDeleteType = null; // "action" | "condition"

let isCreatingNewAction = false;    // 중복생성 방지 플래그
let isCreatingNewCondition = false; // 중복생성 방지 플래그

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("loadingCard").style.display = "flex";

    await Promise.all([loadActionTable(), loadConditionTable()]);

    document.getElementById("loadingCard").style.display = "none";
});

function tableLang() {
    return {
        emptyTable: "데이터가 없습니다.",
        lengthMenu: "Show _MENU_ entries",
        search: "Search:",
        zeroRecords: "No matching records found",
        info: "_START_ - _END_ / 총 _TOTAL_건",
        infoEmpty: "0건",
        paginate: {
            first: "First",
            last: "Last",
            next: "Next",
            previous: "Previous"
        }
    };
}


function loadActionTable() {
    return fetch("/api/v1/actions")
        .then(res => res.json())
        .then(data => {
            const filtered = ruleNoParam ? data.filter(d => d.ruleNo == ruleNoParam) : data;
            if (actionTable) actionTable.destroy();

            actionTable = $("#actionTable").DataTable({
                data: filtered,
                columns: [
                    { data: "actNo" },
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
                                <button class="btn-delete" onclick="confirmDelete('action', ${data.actNo})">삭제</button>
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
    if (isCreatingNewAction) {
        showCustomAlert("이미 생성 중인 항목이 있습니다. 저장 또는 취소 후 다시 시도해 주세요.");
        return;
    }
    isCreatingNewAction = true;

    const ruleNo = ruleNoParam || "";
    const newRow = actionTable.row.add({
        actNo: "-",
        ruleNo: `<input type="number" id="newActRule" value="${ruleNo}" placeholder="Rule No">`,
        actType: `<input type="text" id="newActType" placeholder="Type">`,
        actPriority: `<input type="number" id="newActPriority" placeholder="Priority">`,
        dummy: ""
    }).draw(false).node();

    $('#actionTable tbody').append(newRow);

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

    if (!ruleNo || !actType || !actPriority) {
        showCustomAlert("모든 필드를 입력하세요.");
        return;
    }

    const payload = {
        ruleNo: parseInt(ruleNo),
        actType,
        actParam: "{}",
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
            showCustomAlert("등록 성공!", [`POST /actions`, `Payload: ${JSON.stringify(payload)}`]);
            isCreatingNewAction = false;
            loadActionTable();
        } else {
            res.text().then(msg => showCustomAlert("등록 실패", [msg]));
        }
    });
}

function cancelNewAction(btn) {
    actionTable.row($(btn).closest("tr")).remove().draw();
    isCreatingNewAction = false;
}

function editAction(id, btn) {
    showCustomAlert("Action 수정 기능은 현재 제공되지 않습니다.<br>필요 시 구현 바랍니다.");
}

function loadConditionTable() {
    return fetch("/api/v1/conditions")
        .then(res => res.json())
        .then(data => {
            const filtered = ruleNoParam ? data.filter(d => d.ruleNo == ruleNoParam) : data;
            if (conditionTable) conditionTable.destroy();

            conditionTable = $("#conditionTable").DataTable({
                data: filtered,
                columns: [
                    { data: "conNo" },
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
                                <button class="btn-delete" onclick="confirmDelete('condition', ${data.conNo})">삭제</button>
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
    if (isCreatingNewCondition) {
        showCustomAlert("이미 생성 중인 항목이 있습니다. 저장 또는 취소 후 다시 시도해 주세요.");
        return;
    }
    isCreatingNewCondition = true;

    const ruleNo = ruleNoParam || "";
    const newRow = conditionTable.row.add({
        conNo: "-",
        ruleNo: `<input type="number" id="newConRule" value="${ruleNo}" placeholder="Rule No">`,
        conType: `<input type="text" id="newConType" placeholder="Type">`,
        conField: `<input type="text" id="newConField" placeholder="Field">`,
        conValue: `<input type="text" id="newConValue" placeholder="Value">`,
        conPriority: `<input type="number" id="newConPriority" placeholder="Priority">`,
        dummy: ""
    }).draw(false).node();

    $('#conditionTable tbody').append(newRow);

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

    if (!ruleNo || !conType || !conField || !conValue || !conPriority) {
        showCustomAlert("모든 필드를 입력하세요.");
        return;
    }

    const payload = {
        ruleNo: parseInt(ruleNo),
        conType,
        conField,
        conValue,
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
            showCustomAlert("등록 성공!", [`POST /conditions`, `Payload: ${JSON.stringify(payload)}`]);
            isCreatingNewCondition = false;
            loadConditionTable();
        } else {
            res.text().then(msg => showCustomAlert("등록 실패", [msg]));
        }
    });
}

function cancelNewCondition(btn) {
    conditionTable.row($(btn).closest("tr")).remove().draw();
    isCreatingNewCondition = false;
}

function editCondition(id, btn) {
    showCustomAlert("Condition 수정 기능은 현재 제공되지 않습니다.<br>필요 시 구현 바랍니다.");
}

function saveEditCondition(id, btn) {
    const row = $(btn).closest("tr");
    const conType = row.find("#editConType").val();
    const conField = row.find("#editConField").val();
    const conValue = row.find("#editConValue").val();
    const conPriority = row.find("#editConPriority").val();

    const payload = {
        conType,
        conField,
        conValue,
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
            showCustomAlert("수정 성공!", [`PUT /conditions/${id}`, `Payload: ${JSON.stringify(payload)}`]);
            loadConditionTable();
        } else {
            res.text().then(msg => showCustomAlert("수정 실패", [msg]));
        }
    });
}

function viewCondition(id) {
    showCustomAlert(`Condition [${id}] 조회`);
}

function confirmDelete(type, id) {
    pendingDeleteId = id;
    pendingDeleteType = type;
    document.getElementById("confirmMessage").innerText = `${type === "action" ? "Action" : "Condition"} [${id}]을(를) 삭제하시겠습니까?`;
    document.getElementById("customConfirm").style.display = "flex";
}

function confirmOk() {
    if (pendingDeleteType === "action") {
        deleteActionFinal(pendingDeleteId);
    } else {
        deleteConditionFinal(pendingDeleteId);
    }
    document.getElementById("customConfirm").style.display = "none";
}

function confirmCancel() {
    document.getElementById("customConfirm").style.display = "none";
    pendingDeleteId = null;
    pendingDeleteType = null;
}

function deleteActionFinal(id) {
    fetch(`/api/v1/actions/${id}`, {
        method: "DELETE",
        headers: { "X-USER": "test-user@aiot.com" }
    }).then(res => {
        if (res.ok) {
            showCustomAlert("삭제 성공", [`DELETE /actions/${id}`]);
            loadActionTable();
        } else {
            res.text().then(msg => showCustomAlert("삭제 실패", [msg]));
        }
    });
}

function deleteConditionFinal(id) {
    fetch(`/api/v1/conditions/${id}`, {
        method: "DELETE",
        headers: { "X-USER": "test-user@aiot.com" }
    }).then(res => {
        if (res.ok) {
            showCustomAlert("삭제 성공", [`DELETE /conditions/${id}`]);
            loadConditionTable();
        } else {
            res.text().then(msg => showCustomAlert("삭제 실패", [msg]));
        }
    });
}

// 공통 팝업 함수들
function showCustomAlert(message, logs = []) {
    const alertBox = document.getElementById("customAlert");
    alertBox.querySelector(".custom-alert-body").innerHTML = message;

    const logConsole = document.getElementById("logConsole");
    if (logs.length > 0) {
        logConsole.style.display = "block";
        typeLines(logs, "logConsole", 25, 300);
    } else {
        logConsole.style.display = "none";
        logConsole.innerHTML = "";
    }

    alertBox.style.display = "flex";
}

function closeCustomAlert() {
    document.getElementById("customAlert").style.display = "none";
    const logConsole = document.getElementById("logConsole");
    if (logConsole) {
        logConsole.style.display = "none";
        logConsole.innerHTML = "";
    }
}

function typeLines(lines, containerId, delay = 20, lineDelay = 300) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    let lineIndex = 0;

    function typeLine() {
        if (lineIndex >= lines.length) return;

        const line = lines[lineIndex];
        const lineElem = document.createElement("div");
        container.appendChild(lineElem);

        let charIndex = 0;

        function typeChar() {
            if (charIndex < line.length) {
                lineElem.textContent += line[charIndex++];
                setTimeout(typeChar, delay);
            } else {
                lineIndex++;
                setTimeout(typeLine, lineDelay);
            }
        }

        typeChar();
    }

    typeLine();
}
