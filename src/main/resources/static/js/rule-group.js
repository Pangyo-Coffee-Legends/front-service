document.addEventListener("DOMContentLoaded", () => {
    fetchRuleGroups();
});

let dataTable;

function hideLoadingCard() {
    const loadingCard = document.getElementById("loadingCard");
    if (loadingCard) loadingCard.style.display = "none";
}

function fetchRuleGroups() {
    fetch("http://localhost:10263/api/v1/rule-groups")
        .then(response => response.json())
        .then(data => {
            if (dataTable) dataTable.destroy();

            dataTable = $('#ruleGroupTable').DataTable({
                data: data,
                columns: [
                    { data: 'ruleGroupNo' },
                    { data: 'ruleGroupName' },
                    { data: 'ruleGroupDescription' },
                    { data: 'active', render: active => active ? '활성화' : '비활성화' },
                    { data: 'priority' },
                    {
                        data: null,
                        orderable: false,
                        render: (data) => `
                            <div class="action-buttons">
                                <button class="btn-view" onclick="viewRuleGroup(${data.ruleGroupNo})">조회</button>
                                <button class="btn-edit" onclick="editRuleGroup(${data.ruleGroupNo}, this)">수정</button>
                                <button class="btn-delete" onclick="deleteRuleGroup(${data.ruleGroupNo})">삭제</button>
                            </div>
                        `
                    }
                ],
                destroy: true,
                responsive: true,
                autoWidth: false
            });

            hideLoadingCard();
        })
        .catch(error => {
            console.error("RuleGroup 데이터를 불러오는 중 오류 발생:", error);
            hideLoadingCard();
        });
}

function addNewRuleGroup() {
    const newRow = dataTable.row.add({
        ruleGroupNo: '-',
        ruleGroupName: `<input type="text" id="newName" placeholder="이름">`,
        ruleGroupDescription: `<input type="text" id="newDesc" placeholder="설명">`,
        active: true,
        priority: `<input type="number" id="newPriority" placeholder="우선순위">`
    }).draw().node();

    $(newRow).find('td:last').html(`
        <div class="action-buttons">
            <button class="btn-edit" onclick="saveNewRuleGroup(this)">저장</button>
            <button class="btn-delete" onclick="cancelNewRow(this)">취소</button>
        </div>
    `);
}

function saveNewRuleGroup(btn) {
    const row = $(btn).closest('tr');
    const name = row.find('#newName').val();
    const desc = row.find('#newDesc').val();
    const priority = row.find('#newPriority').val();

    if (!name || !priority) {
        alert("이름과 우선순위는 필수입니다.");
        return;
    }

    const payload = {
        ruleGroupName: name,
        ruleGroupDescription: desc,
        priority: parseInt(priority),
        active: true
    };

    fetch("http://localhost:10263/api/v1/rule-groups", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-USER": "test-user@aiot.com"
        },
        body: JSON.stringify(payload)
    })
        .then(res => {
            if (res.ok) {
                alert("등록 성공!");
                fetchRuleGroups();
            } else {
                alert("등록 실패");
            }
        });
}

function cancelNewRow(btn) {
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
    const name = row.find('#editName').val();
    const desc = row.find('#editDesc').val();
    const priority = row.find('#editPriority').val();

    const payload = {
        ruleGroupName: name,
        ruleGroupDescription: desc,
        priority: parseInt(priority),
        active: true
    };

    fetch(`http://localhost:10263/api/v1/rule-groups/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-USER": "test-user@aiot.com"
        },
        body: JSON.stringify(payload)
    }).then(res => {
        if (res.ok) {
            alert("수정 성공!");
            fetchRuleGroups();
        } else {
            alert("수정 실패");
        }
    });
}

function cancelEditRow() {
    fetchRuleGroups();
}

function deleteRuleGroup(id) {
    if (!confirm(`RuleGroup [${id}]을 삭제하시겠습니까?`)) return;

    fetch(`http://localhost:10263/api/v1/rule-groups/${id}`, {
        method: "DELETE",
        headers: {
            "X-USER": "test-user@aiot.com"
        }
    }).then(res => {
        if (res.ok) {
            alert("삭제 성공!");
            fetchRuleGroups();
        } else {
            alert("삭제 실패");
        }
    });
}

function viewRuleGroup(id) {
    window.location.href = `/rule?groupId=${id}`;
}

window.addEventListener('resize', () => {
    if (dataTable) {
        dataTable.columns.adjust().draw();
    }
});
