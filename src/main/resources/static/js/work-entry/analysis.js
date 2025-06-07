document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('analysisForm');
    const promptInput = document.getElementById('promptText');
    const memberInput = document.getElementById('memberSelect');
    const chatBox = document.getElementById('chatBox');
    const threadList = document.getElementById('threadList');
    const createBtn = document.getElementById('createThreadBtn');
    const chartArea = document.getElementById('chartArea');
    const reportBtn = document.getElementById('generateReportBtn');
    const reportMonth = document.getElementById('reportMonth');
    const reportYear = document.getElementById('reportYear');

    let currentThreadId = null;
    let thinkingInterval = null;
    let isSubmitting = false;

    if (reportYear) {
        for (let y = 2000; y <= 2100; y++) {
            const option = document.createElement('option');
            option.value = y;
            option.textContent = `${y}년`;
            if (y === new Date().getFullYear()) {
                option.selected = true;
            }
            reportYear.appendChild(option);
        }
    }

    if (reportBtn) {
        reportBtn.addEventListener('click', () => {
            const mbNo = memberInput.value.trim();
            const month = parseInt(reportMonth.value, 10);
            const year = parseInt(reportYear.value, 10);

            // ✅ 수정됨: 대화 선택 확인 추가
            if (!mbNo || isNaN(month) || isNaN(year) || !currentThreadId) {
                alert("사원, 연도, 월, 대화 목록을 모두 선택해주세요.");
                return;
            }

            const keywordMap = {
                "출근": 1, "지각": 2, "결근": 3, "외근": 4,
                "연차": 5, "병가": 6, "반차": 7, "경조사휴가": 8
            };

            const statusCodes = Object.values(keywordMap).map(String);

            postWithAuth("https://aiot2.live/api/v1/analysis/reports", {
                mbNo: parseInt(mbNo),
                year,
                month,
                statusCodes
            })
                .then(res => {
                    if (!res.ok) throw new Error(`에러 발생 (status: ${res.status})`);
                    return res.json();
                })
                .then(data => {
                    alert("✅ 리포트 분석이 완료되었습니다.");
                    appendChatMessage('ai', data.fullText, { type: 'typing' });
                    if (currentThreadId) {
                        saveMessage(currentThreadId, 'ai', data.fullText);
                    }
                })
                .catch(err => {
                    console.error("❌ 리포트 생성 실패:", err);
                    alert("리포트 생성에 실패했습니다.");
                });
        });
    }

    document.getElementById('downloadPdfBtn').addEventListener('click', function () {
        const mbNo = memberInput.value;
        const year = reportYear.value;
        const month = reportMonth.value;

        if (!mbNo || !year || !month) {
            alert("사원, 연도, 월을 모두 선택해주세요.");
            return;
        }

        fetch(`https://aiot2.live/api/v1/analysis/reports/pdf?mbNo=${mbNo}&year=${year}&month=${month}`, {
            method: 'GET',
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error("PDF 다운로드 실패");
                return res.blob();
            })
            .then(blob => {
                const memberName = memberInput.options[memberInput.selectedIndex].textContent.split('(')[0].trim();
                const today = new Date();
                const fileName = `${memberName}_근태_리포트_${today.getFullYear()}년_${today.getMonth() + 1}월.pdf`;

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            })
            .catch(err => {
                console.error("❌ PDF 다운로드 오류:", err);
                alert("PDF 저장에 실패했습니다.");
            });
    });

    if (!form || !promptInput || !memberInput || !chatBox || !threadList || !createBtn || !chartArea) {
        console.error("❗ 필수 요소가 누락되었습니다. HTML 구조를 다시 확인하세요.");
        return;
    }
    /*
    member-service API 호출하여 드롭다운으로 맴버번호와 이름으로 직관적으로 찾을 수 있음
     */
    fetch('https://aiot2.live/api/v1/members?page=0&size=100', {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            if (!data.content || data.content.length === 0) {
                console.warn("❗ 멤버 데이터가 비어 있습니다.");
                return;
            }
            data.content.forEach(member => {
                const option = document.createElement('option');
                option.value = member.no;
                option.textContent = `${member.name} (${member.no})`;
                memberInput.appendChild(option);
            });
        })
        .catch(err => {
            console.error("❌ 멤버 API 호출 실패:", err);
        });

    promptInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();

            if(isSubmitting) return;

            form.dispatchEvent(new Event('submit'));
        }
    });

    function postWithAuth(url, data) {
        return fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    function appendChatMessage(role, content, options = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = role === 'user' ? 'text-end mb-3' : 'text-start mb-3';

        const bubble = document.createElement('div');
        bubble.className = role === 'user'
            ? 'bg-primary text-white p-3 rounded shadow-sm d-inline-block position-relative'
            : 'bg-light border p-3 rounded shadow-sm d-inline-block position-relative';

        const contentBox = document.createElement('div');
        bubble.appendChild(contentBox);
        wrapper.appendChild(bubble);
        chatBox.appendChild(wrapper);
        chatBox.scrollTop = chatBox.scrollHeight;

        const renderedHtml = window.marked ? marked.parse(content) : content;

        if (options.type === 'thinking') {
            contentBox.textContent = 'AI가 생각중입니다';
            let dotCount = 0;
            thinkingInterval = setInterval(() => {
                dotCount = (dotCount + 1) % 4;
                contentBox.textContent = 'AI가 생각중입니다' + '.'.repeat(dotCount);
            }, 300);
            // 채팅 추가 후 자동 스크롤
            setTimeout(() => {
                wrapper.scrollIntoView({behavior: 'smooth', block: 'end'});
            }, 10);

            return;
        }

        if (options.type === 'typing') {
            contentBox.innerHTML = '';
            const tempEl = document.createElement('div');
            tempEl.innerHTML = renderedHtml;
            const fullHtml = tempEl.textContent || tempEl.innerText || content || '';

            // 💡 렌더링 텍스트 비었을 때는 바로 전체 출력
            if (!fullHtml.trim()) {
                contentBox.innerHTML = renderedHtml || '(출력 없음)';
                if (role === 'ai') appendCopyButton(bubble, content);
                return;
            }

            const splitter = new GraphemeSplitter();
            const splitText = splitter.splitGraphemes(fullHtml);
            let index = 0;

            const interval = setInterval(() => {
                if (index < splitText.length) {
                    contentBox.textContent += splitText[index++];
                    chatBox.scrollTop = chatBox.scrollHeight;
                } else {
                    clearInterval(interval);
                    contentBox.innerHTML = renderedHtml;
                    if (role === 'ai') appendCopyButton(bubble, content);
                }
            }, 20);
        }
    }

        function appendCopyButton(bubble, content) {
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋 복사';
        copyBtn.className = 'btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2';
        copyBtn.style.fontSize = '0.75rem';
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(content).then(() => {
                copyBtn.textContent = '✅ 복사 완료';
                copyBtn.disabled = true;
            }).catch(err => {
                console.error("❌ 클립보드 복사 실패", err);
                copyBtn.textContent = '⚠️ 실패';
            });
        });
        bubble.appendChild(copyBtn);
    }

    function createChartCanvas(title, labels, data, color, type) {
        const canvas = document.createElement('canvas');
        const wrapper = document.createElement('div');
        wrapper.className = 'text-start mb-4';
        wrapper.style.height = '300px';
        wrapper.appendChild(canvas);
        chartArea.innerHTML = '';
        chartArea.appendChild(wrapper);

        new Chart(canvas.getContext('2d'), {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: data,
                    backgroundColor: color,
                    borderColor: color,
                    fill: type !== 'line'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: type === 'bar' ? {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                } : {}
            }
        });
    }

    function parseTextChart(content) {
        const patterns = [
            /(\d{4}-\d{1,2}-\d{1,2})\s*\([가-힣]+\):.*?근무시간\s*(\d+)\s*시간/g,
            /- (\d{4}-\d{2}-\d{2})\s*\([가-힣]+\)\s*=\s*(\d+)\s*시간/g,
            /(\d{4}-\d{2}-\d{2})\s*근무시간.*?(\d+)\s*시간/g,
            /"날짜":\s*"(.*?)".*?"근무시간":\s*"(\d+)"/g
        ];
        for (const pattern of patterns) {
            const matches = [...content.matchAll(pattern)];
            if (matches.length > 0) {
                const labels = matches.map(m => m[1].padStart(10, '0'));
                const data = matches.map(m => parseInt(m[2], 10));
                createChartCanvas("일별 근무시간", labels, data, "#9850ea", "bar");
                return;
            }
        }
    }

    function saveMessage(threadId, role, content) {
        if (!threadId) return Promise.resolve();
        return postWithAuth('https://aiot2.live/api/v1/analysis/histories', {threadId, role, content});

    }

    function loadThreads(memberNo) {
        fetch(`https://aiot2.live/api/v1/analysis/members/${memberNo}/threads`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                threadList.innerHTML = '';
                data.forEach(thread => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex justify-content-between align-items-center';

                    const titleSpan = document.createElement('span');
                    titleSpan.textContent = thread.title;
                    titleSpan.className = 'flex-grow-1';
                    titleSpan.style.cursor = 'pointer';
                    titleSpan.onclick = () => {
                        currentThreadId = thread.threadId;
                        loadHistory(thread.threadId);
                    };

                    const btnGroup = document.createElement('div');
                    btnGroup.className = 'd-flex align-items-center';

                    const editBtn = document.createElement('button');
                    editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
                    editBtn.className = 'btn btn-sm btn-outline-secondary me-1';
                    editBtn.title = '수정';
                    editBtn.onclick = (e) => {
                        e.stopPropagation();
                        let newTitle = prompt('새 대화 제목을 입력하세요', thread.title);
                        while (newTitle !== null) {
                            if (!newTitle.trim()) {
                                alert("제목은 공백일 수 없습니다.");
                                newTitle = prompt('새 대화 제목을 입력하세요', thread.title);
                                continue;
                            }
                            if (confirm(`"${newTitle}"(으)로 수정하시겠습니까?`)) {
                                fetch(`https://aiot2.live/api/v1/analysis/threads/${thread.threadId}`, {
                                    method: 'PUT',
                                    credentials: 'include',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ title: newTitle.trim() })
                                }).then(res => {
                                    if (res.ok) {
                                        alert("✅ 제목이 수정되었습니다.");
                                        loadThreads(memberNo);
                                    } else {
                                        alert("❌ 제목 수정에 실패했습니다.");
                                    }
                                });
                                break;
                            } else {
                                newTitle = prompt('✏️ 새 대화 제목을 다시 입력하세요', newTitle);
                            }
                        }
                    };

                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
                    deleteBtn.className = 'btn btn-sm btn-outline-danger';
                    deleteBtn.title = '삭제';
                    deleteBtn.onclick = (e) => {
                        e.stopPropagation();
                        if (confirm(`"${thread.title}" 대화를 삭제하시겠습니까?`)) {
                            fetch(`https://aiot2.live/api/v1/analysis/threads/${thread.threadId}`, {
                                method: 'DELETE',
                                credentials: 'include'
                            }).then(res => {
                                if (res.status === 204) {
                                    alert(`"${thread.title}"이(가) 삭제되었습니다.`);
                                    loadThreads(memberNo);
                                    chatBox.innerHTML = '';
                                    chartArea.innerHTML = '';
                                } else {
                                    alert("❌ 삭제 실패");
                                }
                            });
                        }
                    };

                    btnGroup.appendChild(editBtn);
                    btnGroup.appendChild(deleteBtn);
                    li.appendChild(titleSpan);
                    li.appendChild(btnGroup);
                    threadList.appendChild(li);
                });
            });
    }

    function loadHistory(threadId) {
        if (!threadId) return;
        chatBox.innerHTML = '';
        chartArea.innerHTML = '';
        fetch(`https://aiot2.live/api/v1/analysis/histories/${threadId}`, {credentials: 'include'})
            .then(res => res.json())
            .then(history => {
                history.reverse().forEach(m => appendChatMessage(m.role, m.content));
            });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // 중복 제출 방지
        if (isSubmitting) return;
        isSubmitting = true;

        const memberNo = memberInput.value.trim();
        const prompt = promptInput.value.trim();
        if (!memberNo || !prompt || !currentThreadId) {
            alert('사원번호, 질문, 대화 선택을 모두 완료하세요.');
            isSubmitting = false;
            return;
        }

        appendChatMessage('user', prompt);
        saveMessage(currentThreadId, 'user', prompt);
        promptInput.value = '';
        appendChatMessage('ai', '', { type: 'thinking' });

        fetch(`https://aiot2.live/api/v1/attendances/${memberNo}/summary/recent`, {credentials: 'include'})
            .then(res => res.json())
            .then(summaryData => {
                const records = summaryData.content.map(r => ({
                    date: `${r.year}-${r.monthValue}-${r.dayOfMonth}`,
                    dayOfWeek: r.dayOfWeek,
                    statusCode: r.code,
                    inTime: r.inTime,
                    outTime: r.outTime
                }));

                const keywordMap = {
                    "출근": 1, "지각": 2, "결근": 3, "외근": 4,
                    "연차": 5, "병가": 6, "반차": 7, "경조사휴가": 8
                };

                const matchedLabels = [];
                const matchedCounts = [];

                Object.entries(keywordMap).forEach(([keyword, code]) => {
                    if (prompt.includes(keyword)) {
                        const filtered = records.filter(r => r.statusCode === code);
                        matchedLabels.push(keyword);
                        matchedCounts.push(filtered.length);
                    }
                });

                if (matchedLabels.length > 0) {
                    createChartCanvas("근태 상태별 일수", matchedLabels, matchedCounts, "#7b78ec", "bar");
                }

                const formattedRecords = records.map(r => {
                    let hour = 0;
                    if (r.inTime && r.outTime) {
                        const inHour = parseInt(r.inTime.substring(11, 13), 10);
                        const outHour = parseInt(r.outTime.substring(11, 13), 10);
                        hour = Math.max(0, outHour - inHour);
                    }
                    const label = `${r.date} (${r.dayOfWeek})`;
                    return `* ${label}: ${r.inTime && r.outTime ? `${r.inTime.substring(11, 16)} 출근, ${r.outTime.substring(11, 16)} 퇴근 (근무시간 ${hour}시간)` : `출근/퇴근 기록 없음 (근무시간 0시간)`}`;
                }).join('\n');

                const messagePayload = [
                    { role: 'user', content: prompt },
                    { role: 'user', content: '[근무 기록]\n' + formattedRecords }
                ];

                return postWithAuth('https://aiot2.live/api/v1/analysis/customs', {
                    memberNo,
                    messages: messagePayload,
                    workRecords: records
                });
            })
            .then(res => res.json())
            .then(data => {
                if (thinkingInterval) clearInterval(thinkingInterval);
                chatBox.lastChild.remove();
                const result = data.fullText || "⚠️ 분석 결과 없음";
                appendChatMessage('ai', result);
                parseTextChart(result);
                saveMessage(currentThreadId, 'ai', result);
            })
            .catch(err => {
                if (thinkingInterval) clearInterval(thinkingInterval);
                chatBox.lastChild.remove();
                console.error('❌ 분석 흐름 오류:', err);
                appendChatMessage('ai', `❗ 오류: ${err.message}`);
            })
            .finally(() => {
                isSubmitting = false;
            });
    });

    createBtn.addEventListener('click', () => {
        const mbNo = memberInput.value.trim();
        if (!mbNo || isNaN(mbNo)) {
            alert('먼저 사원을 선택하세요.');
            return;
        }
        const title = prompt('새 대화 제목을 입력하세요');
        if (!title?.trim()) return;

        postWithAuth('https://aiot2.live/api/v1/analysis/threads', {mbNo, title: title.trim()})
            .then(res => res.json())
            .then(thread => {
                currentThreadId = thread.threadId;
                loadThreads(mbNo);
                chatBox.innerHTML = '';
                chartArea.innerHTML = '';
            });
    });

    memberInput.addEventListener('change', () => {
        const mbNo = memberInput.value.trim();
        if (mbNo) loadThreads(mbNo);
    });
});