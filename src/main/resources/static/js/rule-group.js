// rule-group.js (중복 생성 방지 포함)
const API_BASE = "http://localhost:10251/api/v1";
let dataTable;
let confirmCallback = null;
let isCreatingNewGroup = false;

document.addEventListener("DOMContentLoaded", () => {
    fetchRuleGroups();
});

function fetchWithAuth(url, options = {}) {
    const defaultHeaders = {
        "X-USER": "test-user@aiot.com",
        "Content-Type": "application/json"
    };

    return fetch(url, {
        credentials: "include",
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {})
        }
    });
}

function hideLoadingCard() {
    const card = document.getElementById("loadingCard");
    if (card) card.style.display = "none";
}

function fetchRuleGroups() {
    fetchWithAuth(`${API_BASE}/rule-groups`)
        .then(res => res.json())
        .then(data => {
            if (dataTable) dataTable.destroy();

            dataTable = $('#ruleGroupTable').DataTable({
                data,
                columns: [
                    { data: 'ruleGroupNo' },
                    { data: 'ruleGroupName' },
                    { data: 'ruleGroupDescription' },
                    {
                        data: 'active',
                        render: val => val ? '✔' : '✘'
                    },
                    {
                        data: 'priority',
                        render: val => val ?? ''
                    },
                    {
                        data: null,
                        orderable: false,
                        render: data => `
                            <div class="action-buttons">
                                <button class="btn-view" onclick="viewRuleGroup(${data.ruleGroupNo})">조회</button>
                                <button class="btn-edit" onclick="editRuleGroup(${data.ruleGroupNo}, this)">수정</button>
                                <button class="btn-delete" onclick="onDeleteRuleGroup(${data.ruleGroupNo})">삭제</button>
                            </div>
                        `
                    }
                ],
                responsive: true,
                autoWidth: false,
                order: []
            });

            isCreatingNewGroup = false;
            hideLoadingCard();
        })
        .catch(err => {
            hideLoadingCard();
            showCustomAlert("RuleGroup 목록을 불러오는 중 오류가 발생했습니다.", "시스템 오류", (err.message || '').split("\n"));
        });
}

function addNewRuleGroup() {
    if (isCreatingNewGroup) {
        showCustomAlert("이미 생성 중인 항목이 있습니다. 저장 또는 취소 후 다시 시도해 주세요.");
        return;
    }

    isCreatingNewGroup = true;

    const newRowData = {
        ruleGroupNo: '-',
        ruleGroupName: `<input type="text" id="newName" placeholder="이름">`,
        ruleGroupDescription: `<input type="text" id="newDesc" placeholder="설명">`,
        active: true,
        priority: `<input type="number" id="newPriority" placeholder="우선순위">`
    };

    const newRow = dataTable.row.add(newRowData).draw(false).node();
    $('#ruleGroupTable tbody').append(newRow);

    $(newRow).find('td:last').html(`
        <div class="action-buttons">
            <button class="btn-edit" onclick="saveNewRuleGroup(this)">저장</button>
            <button class="btn-delete" onclick="cancelNewRow(this)">취소</button>
        </div>
    `);
}

function saveNewRuleGroup(btn) {
    const row = $(btn).closest('tr');
    const name = row.find('#newName').val()?.trim();
    const desc = row.find('#newDesc').val()?.trim();
    const priority = row.find('#newPriority').val();

    if (!name || priority === '') {
        showCustomAlert("<이름>과 <우선순위>는 필수입니다.", "입력 오류");
        return;
    }

    const payload = {
        ruleGroupName: name,
        ruleGroupDescription: desc || '',
        priority: parseInt(priority),
        active: true
    };

    fetchWithAuth(`${API_BASE}/rule-groups`, {
        method: "POST",
        body: JSON.stringify(payload)
    })
        .then(res => {
            if (res.ok) {
                showCustomAlert("등록이 완료되었습니다.", "로그 출력", [
                    `POST /rule-groups`,
                    `Payload: ${JSON.stringify(payload)}`
                ]);
                fetchRuleGroups();
            } else {
                return res.text().then(msg => {
                    throw new Error(`등록 실패: ${msg}`);
                });
            }
        })
        .catch(err => {
            showCustomAlert("RuleGroup 등록 중 오류가 발생했습니다.", "로그 출력", (err.message || '').split("\n"));
        })
        .finally(() => {
            isCreatingNewGroup = false;
        });
}

function cancelNewRow(btn) {
    isCreatingNewGroup = false;
    dataTable.row($(btn).closest('tr')).remove().draw();
}

function editRuleGroup(id, btn) {
    const row = $(btn).closest('tr');
    const cells = row.find('td');

    const name = cells.eq(1).text();
    const desc = cells.eq(2).text();
    const priority = cells.eq(4).text();

    cells.eq(1).html(`<input type="text" id="editName" value="${name}">`);
    cells.eq(2).html(`<input type="text" id="editDesc" value="${desc}">`);
    cells.eq(4).html(`<input type="number" id="editPriority" value="${priority}">`);

    cells.eq(5).html(`
        <div class="action-buttons">
            <button class="btn-edit" onclick="saveEditRow(${id}, this)">저장</button>
            <button class="btn-delete" onclick="cancelEditRow()">취소</button>
        </div>
    `);
}

function saveEditRow(id, btn) {
    const row = $(btn).closest('tr');
    const name = row.find('#editName').val()?.trim();
    const desc = row.find('#editDesc').val()?.trim();
    const priority = row.find('#editPriority').val();

    const payload = {
        ruleGroupName: name,
        ruleGroupDescription: desc || '',
        priority: parseInt(priority),
        active: true
    };

    fetchWithAuth(`${API_BASE}/rule-groups/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    })
        .then(res => {
            if (res.ok) {
                showCustomAlert("수정이 완료되었습니다.", "로그 출력", [
                    `PUT /rule-groups/${id}`,
                    `Payload: ${JSON.stringify(payload)}`
                ]);
                fetchRuleGroups();
            } else {
                return res.text().then(msg => {
                    throw new Error(`수정 실패: ${msg}`);
                });
            }
        })
        .catch(err => {
            showCustomAlert("RuleGroup 수정 중 오류가 발생했습니다.", "로그 출력", (err.message || '').split("\n"));
        });
}

function cancelEditRow() {
    fetchRuleGroups();
}

function onDeleteRuleGroup(id) {
    showConfirmDialog(`정말 RuleGroup [${id}]을 삭제하시겠습니까?`, () => deleteRuleGroup(id));
}

function deleteRuleGroup(id) {
    fetchWithAuth(`${API_BASE}/rule-groups/${id}`, {
        method: "DELETE"
    })
        .then(res => {
            if (res.ok) {
                showCustomAlert("삭제가 완료되었습니다.", "로그 출력", [`DELETE /rule-groups/${id}`]);
                fetchRuleGroups();
            } else {
                return res.json().then(err => {
                    const errorMsg = (err?.error || '').toLowerCase();
                    const status = err?.status || 0;

                    if ((errorMsg.includes("internal server error") || errorMsg.includes("constraint")) && status === 500) {
                        throw new Error("Error: 해당 RuleGroup 외래키 존재 (Rule/Action/Condition)\n먼저 관련 데이터를 삭제한 후 다시 시도해 주세요.");
                    } else {
                        throw new Error(`❌ 삭제 실패: ${JSON.stringify(err)}`);
                    }
                });
            }
        })
        .catch(err => {
            showCustomAlert("RuleGroup 삭제 중 오류가 발생했습니다.", "로그 출력", (err.message || '').split("\n"));
        });
}

function viewRuleGroup(id) {
    window.location.href = `/rule?groupId=${id}`;
}

function showCustomAlert(message, title = "로그 출력", logs = []) {
    const alertBox = document.getElementById("customAlert");
    alertBox.querySelector(".custom-alert-header").innerHTML = title;
    alertBox.querySelector(".custom-alert-body").innerHTML = message;

    const logConsole = document.getElementById("logConsole");
    if (logs.length > 0 && logConsole) {
        logConsole.style.display = "block";
        typeLines(logs, "logConsole", 25, 400);
    } else {
        logConsole.style.display = "none";
        logConsole.innerHTML = '';
    }

    alertBox.style.display = "flex";
}

function closeCustomAlert() {
    document.getElementById("customAlert").style.display = "none";
    clearCustomLogs();
}

function showConfirmDialog(message, onConfirm) {
    document.getElementById("confirmMessage").innerHTML = message;
    document.getElementById("customConfirm").style.display = "flex";
    confirmCallback = onConfirm;
}

function confirmOk() {
    document.getElementById("customConfirm").style.display = "none";
    if (confirmCallback) confirmCallback();
}

function confirmCancel() {
    document.getElementById("customConfirm").style.display = "none";
    confirmCallback = null;
}

function clearCustomLogs() {
    const logConsole = document.getElementById("logConsole");
    if (logConsole) {
        logConsole.style.display = 'none';
        logConsole.innerHTML = '';
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