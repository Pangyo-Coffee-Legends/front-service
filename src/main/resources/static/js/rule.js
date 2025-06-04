const API_BASE = "http://localhost:10251/api/v1";

let globalGroupMap = {};
let globalRules = [];
let dataTable;
let pendingDeleteId = null;
let isCreatingNewRule = false;

document.addEventListener("DOMContentLoaded", async () => {
    await fetchRulesWithGroupNames();
});

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function fetchWithAuth(url, options = {}) {
    const defaultHeaders = {
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

async function fetchRulesWithGroupNames() {
    document.getElementById("loadingCard").style.display = "flex";

    try {
        const [ruleGroupsRes, rulesRes] = await Promise.all([
            fetchWithAuth(`${API_BASE}/rule-groups`),
            fetchWithAuth(`${API_BASE}/rules`)
        ]);

        const ruleGroups = await ruleGroupsRes.json();
        const rules = await rulesRes.json();

        globalRules = rules;
        globalGroupMap = Object.fromEntries(
            ruleGroups.map(group => [group.ruleGroupNo, group.ruleGroupName])
        );

        renderRuleTable();
    } catch (error) {
        showCustomAlert("❌ Rule 목록 불러오기 실패", [error.message]);
    } finally {
        document.getElementById("loadingCard").style.display = "none";
        isCreatingNewRule = false;
    }
}

function renderRuleTable() {
    const selectedGroupId = getQueryParam("groupId");
    const filteredRules = selectedGroupId
        ? globalRules.filter(rule => rule.ruleGroupNo == selectedGroupId)
        : globalRules;

    if (dataTable) dataTable.destroy();

    dataTable = $('#ruleTable').DataTable({
        data: filteredRules,
        columns: [
            { data: 'ruleNo' },
            {
                data: 'ruleGroupNo',
                render: groupNo => `${globalGroupMap[groupNo] || 'N/A'} (${groupNo})`
            },
            { data: 'ruleName' },
            { data: 'ruleDescription' },
            { data: 'rulePriority' },
            {
                data: 'active',
                render: val => val ? '✔' : '✘'
            },
            {
                data: 'createdAt',
                render: val => val ? new Date(val).toLocaleString() : ''
            },
            {
                data: 'updatedAt',
                render: val => val ? new Date(val).toLocaleString() : ''
            },
            {
                data: null,
                orderable: false,
                render: data => `
                    <div class="action-buttons">
                        <button class="btn-view" onclick="viewRule(${data.ruleNo})">조회</button>
                        <button class="btn-edit" onclick="editRule(${data.ruleNo}, this)">수정</button>
                        <button class="btn-delete" onclick="confirmDeleteRule(${data.ruleNo})">삭제</button>
                    </div>
                `
            }
        ]
    });
}

function addNewRule() {
    if (isCreatingNewRule) {
        showCustomAlert("이미 생성 중인 항목이 있습니다. 저장 또는 취소 후 다시 시도해 주세요.");
        return;
    }
    isCreatingNewRule = true;

    const groupOptions = Object.entries(globalGroupMap)
        .map(([no, name]) => `<option value="${no}">${name}</option>`)
        .join("");

    const newRowHtml = `
        <tr class="new-rule-row">
            <td>-</td>
            <td><select id="newGroupId">${groupOptions}</select></td>
            <td><input type="text" id="newName" placeholder="Rule 이름"></td>
            <td><input type="text" id="newDesc" placeholder="설명"></td>
            <td><input type="number" id="newPriority" placeholder="우선순위"></td>
            <td>✔</td>
            <td></td>
            <td></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="saveNewRule(this)">저장</button>
                    <button class="btn-delete" onclick="cancelNewRow(this)">취소</button>
                </div>
            </td>
        </tr>
    `;

    $('#ruleTable tbody').append(newRowHtml);
}

function saveNewRule(btn) {
    const row = $(btn).closest('tr');
    const groupId = row.find('#newGroupId').val();
    const name = row.find('#newName').val()?.trim();
    const desc = row.find('#newDesc').val()?.trim();
    const priority = row.find('#newPriority').val();

    if (!groupId || !name || !priority) {
        showCustomAlert("Group No, 이름, 우선순위는 필수입니다.");
        return;
    }

    const payload = {
        ruleGroupNo: parseInt(groupId),
        ruleName: name,
        ruleDescription: desc || '',
        rulePriority: parseInt(priority),
        active: true
    };

    fetchWithAuth(`${API_BASE}/rules`, {
        method: "POST",
        body: JSON.stringify(payload)
    })
        .then(res => {
            if (res.ok) {
                showCustomAlert("등록 성공!", [`POST /rules`, `Payload: ${JSON.stringify(payload)}`]);
                fetchRulesWithGroupNames();
            } else {
                return res.text().then(msg => {
                    throw new Error(`등록 실패: ${msg}`);
                });
            }
        })
        .catch(err => {
            showCustomAlert("Rule 등록 실패", (err.message || "").split("\n"));
        });
}

function cancelNewRow(btn) {
    $(btn).closest('tr').remove();
    isCreatingNewRule = false;
}

function editRule(id, btn) {
    const row = $(btn).closest('tr');
    const cells = row.find('td');

    const groupNoText = cells.eq(1).text();
    const groupOptions = Object.entries(globalGroupMap)
        .map(([no, name]) => {
            const selected = groupNoText.includes(no) ? "selected" : "";
            return `<option value="${no}" ${selected}>${name}</option>`;
        }).join("");

    const name = cells.eq(2).text();
    const desc = cells.eq(3).text();
    const priority = cells.eq(4).text();

    cells.eq(1).html(`<select id="editGroupId">${groupOptions}</select>`);
    cells.eq(2).html(`<input type="text" id="editName" value="${name}">`);
    cells.eq(3).html(`<input type="text" id="editDesc" value="${desc}">`);
    cells.eq(4).html(`<input type="number" id="editPriority" value="${priority}">`);

    cells.eq(8).html(`
        <div class="action-buttons">
            <button class="btn-edit" onclick="saveEditRule(${id}, this)">저장</button>
            <button class="btn-delete" onclick="cancelEditRule()">취소</button>
        </div>
    `);
}

function saveEditRule(id, btn) {
    const row = $(btn).closest('tr');
    const groupId = row.find('#editGroupId').val();
    const name = row.find('#editName').val()?.trim();
    const desc = row.find('#editDesc').val()?.trim();
    const priority = row.find('#editPriority').val();

    if (!groupId || !name || !priority) {
        showCustomAlert("그룹, 이름, 우선순위는 필수입니다.");
        return;
    }

    const payload = {
        ruleGroupNo: parseInt(groupId),
        ruleName: name,
        ruleDescription: desc || '',
        rulePriority: parseInt(priority),
        active: true
    };

    fetchWithAuth(`${API_BASE}/rules/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    })
        .then(res => {
            if (res.ok) {
                showCustomAlert("수정 성공!", [`PUT /rules/${id}`, `Payload: ${JSON.stringify(payload)}`]);
                fetchRulesWithGroupNames();
            } else {
                return res.text().then(msg => {
                    throw new Error(`수정 실패: ${msg}`);
                });
            }
        })
        .catch(err => {
            showCustomAlert("Rule 수정 실패", (err.message || "").split("\n"));
        });
}

function cancelEditRule() {
    fetchRulesWithGroupNames();
}

function confirmDeleteRule(id) {
    pendingDeleteId = id;
    document.getElementById("confirmMessage").innerText = `Rule [${id}]을(를) 삭제하시겠습니까?`;
    document.getElementById("customConfirm").style.display = "flex";
}

function confirmOk() {
    deleteRule(pendingDeleteId);
    document.getElementById("customConfirm").style.display = "none";
    pendingDeleteId = null;
}

function confirmCancel() {
    document.getElementById("customConfirm").style.display = "none";
    pendingDeleteId = null;
}

function deleteRule(id) {
    fetchWithAuth(`${API_BASE}/rules/${id}`, {
        method: "DELETE"
    })
        .then(res => {
            if (res.ok) {
                showCustomAlert("삭제 성공!", [`DELETE /rules/${id}`]);
                fetchRulesWithGroupNames();
            } else {
                return res.json().then(err => {
                    const errorMsg = (err?.error || "").toLowerCase();
                    const status = err?.status || 0;

                    if (
                        (errorMsg.includes("internal server error") || errorMsg.includes("constraint")) &&
                        status === 500
                    ) {
                        throw new Error(
                            "해당 Rule에 연결된 하위 데이터(Action/Condition)가 존재합니다.\n먼저 관련 데이터를 삭제한 후 다시 시도해 주세요."
                        );
                    } else {
                        throw new Error(`❌ 삭제 실패: ${JSON.stringify(err)}`);
                    }
                });
            }
        })
        .catch(err => {
            showCustomAlert("Rule 삭제 실패", (err.message || "").split("\n"));
        });
}

function viewRule(id) {
    window.location.href = `/action-condition?ruleNo=${id}`;
}

window.addEventListener('resize', () => {
    if (dataTable) {
        dataTable.columns.adjust().draw();
    }
});

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

function showCustomAlert(message, logs = []) {
    const alertBox = document.getElementById("customAlert");
    alertBox.querySelector(".custom-alert-header").innerHTML = "로그 출력";
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

window.addEventListener("load", () => {
    const coffee = document.querySelector(".popup-coffee");
    if (coffee && coffee.complete) {
        coffee.style.visibility = "visible";
    } else if (coffee) {
        coffee.onload = () => {
            coffee.style.visibility = "visible";
        };
    }
});
