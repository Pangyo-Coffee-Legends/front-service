document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('analysisForm');
    const promptInput = document.getElementById('promptText');
    const memberInput = document.getElementById('memberSelect');
    const chatBox = document.getElementById('chatBox');
    const threadList = document.getElementById('threadList');
    const createBtn = document.getElementById('createThreadBtn');
    const chartArea = document.getElementById('chartArea');
    let currentThreadId = null;
    let thinkingInterval = null;
    /*
    위 요소들 중 하나라도 누락되면 콘솔에 에러메시지 추가 부분
     */
    if (!form || !promptInput || !memberInput || !chatBox || !threadList || !createBtn || !chartArea) {
        console.error("❗ 필수 요소가 누락되었습니다. HTML 구조를 다시 확인하세요.");
        return;
    }
    /*
    member-service API 호출하여 드롭다운으로 맴버번호와 이름으로 직관적으로 찾을 수 있음
     */
    fetch('http://localhost:10251/api/v1/members?page=0&size=100', {credentials: 'include'})
        .then(res => res.json())
        .then(data => {
            data.content.forEach(member => {
                const option = document.createElement('option');
                option.value = member.no;
                option.textContent = `${member.name} (${member.no})`;
                memberInput.appendChild(option);
            });
        });
    promptInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });

    /**
     * @function postWithAuth
     * @description 인증 정보와 함께 JSON 데이터를 POST 방식으로 전송하는 유틸리티 함수입니다.
     * @param {string} url - 요청을 보낼 서버 API URL
     * @param {object} data - 전송할 JSON 데이터 객체
     * @return {Promise<Response>} fetch의 응답 Promise 객체를 반환합니다.
     */

    function postWithAuth(url, data) {
        return fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
    }

    /**
     * @function appendChatMessage
     * @description 채팅창에 메시지를 추가합니다. 사용자/AI 역할에 따라 스타일을 구분하고, 타이핑 애니메이션 또는 로딩 메시지도 지원합니다.
     * @param {string} role - 'user' 또는 'ai'
     * @param {string} content - 출력할 텍스트 내용
     * @param {object} options - { type: 'typing' | 'thinking' } 옵션을 통해 표시 방식 지정
     */
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
            return;
        }

        if (options.type === 'typing') {
            contentBox.innerHTML = '';
            let index = 0;
            const tempEl = document.createElement('div');
            tempEl.innerHTML = renderedHtml;
            const fullHtml = tempEl.textContent || tempEl.innerText || '';
            const interval = setInterval(() => {
                if (index < fullHtml.length) {
                    contentBox.textContent += fullHtml.charAt(index++);
                    chatBox.scrollTop = chatBox.scrollHeight;
                } else {
                    clearInterval(interval);
                    contentBox.innerHTML = renderedHtml;
                    if (role === 'ai') appendCopyButton(bubble, content);
                }
            }, 0);
        } else {
            contentBox.innerHTML = renderedHtml;
            if (role === 'ai') appendCopyButton(bubble, content);
        }
    }

    /**
     * @function appendCopyButton
     * @description 채팅 버블 우측 상단에 복사 버튼을 추가하고, 복사 기능을 지원합니다.
     * @param {HTMLElement} bubble - 채팅 메시지 영역
     * @param {string} content - 복사 대상 텍스트
     */
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

    /**
     * @function createChartCanvas
     * @description 분석 결과를 그래프로 시각화하여 출력합니다. 기존 그래프는 초기화되고 새 캔버스가 생성됩니다.
     * @param {string} title - 그래프 제목
     * @param {string[]} labels - X축 라벨 목록
     * @param {number[]} data - Y축 데이터 배열
     * @param {string} color - 그래프 색상 코드
     * @param {string} type - 그래프 유형 ('bar' 또는 'line')
     */

    function createChartCanvas(title, labels, data, color, type) {
        const canvas = document.createElement('canvas');
        const wrapper = document.createElement('div');
        wrapper.className = 'text-start mb-4';
        wrapper.style.height = '300px'; // 그래프 높이 축소
        wrapper.appendChild(canvas);
        chartArea.innerHTML = ''; // 그래프 초기화
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
                    y: {beginAtZero: true, ticks: {stepSize: 1}}
                } : {}
            }
        });
    }

    /**
     * @function parseTextChart
     * @description AI 응답 결과에서 날짜와 근무시간 패턴을 감지하여 차트로 변환합니다.
     * @param {string} content - AI가 생성한 응답 텍스트
     */
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
                createChartCanvas("일별 근무시간", labels, data, "#42a5f5", "bar");
                return;
            }
        }
    }

    /**
     * @function saveMessage
     * @description 채팅 메시지를 현재 쓰레드 ID에 저장합니다. 서버에 메시지를 POST 전송합니다.
     * @param {string} threadId - 대화 쓰레드 ID
     * @param {string} role - 'user' 또는 'ai'
     * @param {string} content - 저장할 메시지 내용
     * @return {Promise} 저장 결과 Promise 객체
     */
    function saveMessage(threadId, role, content) {
        if (!threadId) return Promise.resolve();
        return postWithAuth('http://localhost:10251/api/v1/analysis/history/save', {threadId, role, content});
    }

    /**
     * @function loadThreads
     * @description 선택한 사원 번호에 해당하는 대화 쓰레드 목록을 불러와 UI에 표시합니다.
     * @param {string} memberNo - 선택한 사원의 번호
     */
    function loadThreads(memberNo) {
        fetch(`http://localhost:10251/api/v1/analysis/thread/${memberNo}`, { credentials: 'include' })
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

                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
                    deleteBtn.className = 'btn btn-sm btn-outline-danger ms-2';
                    deleteBtn.title = '삭제';
                    deleteBtn.onclick = (e) => {
                        e.stopPropagation(); // 부모 클릭 이벤트 방지
                        if (confirm(`"${thread.title}" 대화를 삭제하시겠습니까?`)) {
                            fetch(`http://localhost:10251/api/v1/analysis/thread/${thread.threadId}`, {
                                method: 'DELETE',
                                credentials: 'include'
                            })
                                .then(res => {
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

                    li.appendChild(titleSpan);
                    li.appendChild(deleteBtn);
                    threadList.appendChild(li);
                });
            });
    }


    /**
     * @function loadHistory
     * @description 선택한 쓰레드 ID의 대화 히스토리를 서버에서 가져와 출력합니다.
     * @param {string} threadId - 대화 쓰레드 ID
     */
    function loadHistory(threadId) {
        if (!threadId) return;
        chatBox.innerHTML = '';
        chartArea.innerHTML = '';
        fetch(`http://localhost:10251/api/v1/analysis/history/${threadId}`, {credentials: 'include'})
            .then(res => res.json())
            .then(history => {
                history.reverse().forEach(m => appendChatMessage(m.role, m.content));
            });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const memberNo = memberInput.value.trim();
        const prompt = promptInput.value.trim();
        if (!memberNo || !prompt || !currentThreadId) {
            alert('사원번호, 질문, 대화 선택을 모두 완료하세요.');
            return;
        }

        appendChatMessage('user', prompt);
        saveMessage(currentThreadId, 'user', prompt);
        promptInput.value = '';
        appendChatMessage('ai', '', {type: 'thinking'});

        fetch(`http://localhost:10251/api/v1/attendances/summary/recent/${memberNo}`, {credentials: 'include'})
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
                    "연차": 5, "질병": 6, "반차": 7, "상": 8
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
                    {role: 'user', content: prompt},
                    {role: 'user', content: '[근무 기록]\n' + formattedRecords}
                ];

                return postWithAuth('http://localhost:10251/api/v1/analysis/custom', {
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

                if (result.includes('import matplotlib') || result.includes('plt.')) {
                    if (prompt.includes('파이선') || prompt.includes('파이썬') || prompt.toLowerCase().includes('python')) {
                        appendChatMessage('ai', result, {type: 'typing'});
                    } else {
                        appendChatMessage('ai', "아래 자료는 요청하신 자료입니다. 자세한 정보는 추가 요청을 부탁드립니다.");
                    }
                } else {
                    appendChatMessage('ai', result);
                    parseTextChart(result);
                }

                saveMessage(currentThreadId, 'ai', result);
            })
            .catch(err => {
                if (thinkingInterval) clearInterval(thinkingInterval);
                chatBox.lastChild.remove();
                console.error('❌ 분석 흐름 오류:', err);
                appendChatMessage('ai', `❗ 오류: ${err.message}`);
            });
    });

    createBtn.addEventListener('click', () => {
        const mbNo = memberInput.value.trim();
        if (!mbNo || isNaN(mbNo)) {
            alert('유효한 사원번호를 입력하세요.');
            return;
        }
        const title = prompt('새 대화 제목을 입력하세요');
        if (!title?.trim()) return;

        postWithAuth('http://localhost:10251/api/v1/analysis/thread', {mbNo, title: title.trim()})
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
