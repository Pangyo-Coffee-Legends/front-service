document.addEventListener("DOMContentLoaded", async () => {
    await fetchRulesWithGroupNames();
});

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

const API_BASE = "http://localhost:10251/api/v1";

let globalGroupMap = {};
let globalRules = [];
let dataTable;

async function fetchRulesWithGroupNames() {
    document.getElementById("loadingCard").style.display = "flex"; // 로딩 시작

    const headers = {
        "Accept": "application/json",
    };

    try {
        const [ruleGroupsRes, rulesRes] = await Promise.all([
            fetch(`${API_BASE}/rule-groups`, { headers, credentials: "include" }),
            fetch(`${API_BASE}/rules`, { headers, credentials: "include" })
        ]);

        const ruleGroups = await ruleGroupsRes.json();
        const rules = await rulesRes.json();

        globalRules = rules;
        globalGroupMap = Object.fromEntries(
            ruleGroups.map(group => [group.ruleGroupNo, group.ruleGroupName])
        );

        renderRuleTable();
    } catch (error) {
        console.error("❌ Rule 목록 불러오기 실패:", error);
    } finally {
        document.getElementById("loadingCard").style.display = "none"; // 로딩 종료
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
                render: groupNo => globalGroupMap[groupNo] || 'N/A'
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
                        <button class="btn-delete" onclick="deleteRule(${data.ruleNo})">삭제</button>
                    </div>
                `
            }
        ],
        destroy: true,
        language: {
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
        }
    });
}

function addNewRule() {
    const groupOptions = Object.entries(globalGroupMap)
        .map(([no, name]) => `<option value="${no}">${name}</option>`)
        .join("");

    const newRow = dataTable.row.add({
        ruleNo: '-',
        ruleGroupNo: '',
        ruleName: '',
        ruleDescription: '',
        rulePriority: '',
        active: true,
        createdAt: '',
        updatedAt: '',
        null: ''
    }).draw().node();

    $(newRow).find('td').eq(1).html(`<select id="newGroupId">${groupOptions}</select>`);
    $(newRow).find('td').eq(2).html(`<input type="text" id="newName" placeholder="Rule 이름">`);
    $(newRow).find('td').eq(3).html(`<input type="text" id="newDesc" placeholder="설명">`);
    $(newRow).find('td').eq(4).html(`<input type="number" id="newPriority" placeholder="우선순위">`);
    $(newRow).find('td').eq(8).html(`
        <div class="action-buttons">
            <button class="btn-edit" onclick="saveNewRule(this)">저장</button>
            <button class="btn-delete" onclick="cancelNewRow(this)">취소</button>
        </div>
    `);
}

function saveNewRule(btn) {
    const row = $(btn).closest('tr');
    const groupId = row.find('#newGroupId').val();
    const name = row.find('#newName').val();
    const desc = row.find('#newDesc').val();
    const priority = row.find('#newPriority').val();

    if (!groupId || !name || !priority) {
        alert("Group No, 이름, 우선순위는 필수입니다.");
        return;
    }

    const payload = {
        ruleGroupNo: parseInt(groupId),
        ruleName: name,
        ruleDescription: desc || '',
        rulePriority: parseInt(priority),
        active: true
    };

    fetch(`${API_BASE}/rules`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload)
    }).then(res => {
        if (res.ok) {
            alert("등록 성공!");
            fetchRulesWithGroupNames();
        } else {
            alert("등록 실패");
        }
    });
}

function cancelNewRow(btn) {
    dataTable.row($(btn).closest('tr')).remove().draw();
}

function editRule(id, btn) {
    const row = $(btn).closest('tr');
    const cells = row.find('td');

    const name = cells.eq(2).text();
    const desc = cells.eq(3).text();
    const priority = cells.eq(4).text();

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
    const name = row.find('#editName').val();
    const desc = row.find('#editDesc').val();
    const priority = row.find('#editPriority').val();

    if (!name || !priority) {
        alert("이름과 우선순위는 필수입니다.");
        return;
    }

    const payload = {
        ruleName: name,
        ruleDescription: desc || '',
        rulePriority: parseInt(priority),
        active: true
    };

    fetch(`${API_BASE}/rules/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-USER": "test-user@aiot.com"
        },
        credentials: "include",
        body: JSON.stringify(payload)
    }).then(res => {
        if (res.ok) {
            alert("수정 성공!");
            fetchRulesWithGroupNames();
        } else {
            alert("수정 실패");
        }
    });
}

function cancelEditRule() {
    fetchRulesWithGroupNames();
}

function deleteRule(id) {
    if (!confirm(`Rule [${id}]을 삭제하시겠습니까?`)) return;

    fetch(`${API_BASE}/rules/${id}`, {
        method: "DELETE",
        headers: {
            "X-USER": "test-user@aiot.com"
        },
        credentials: "include"
    }).then(res => {
        if (res.ok) {
            alert("삭제 성공!");
            fetchRulesWithGroupNames();
        } else {
            alert("삭제 실패");
        }
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
