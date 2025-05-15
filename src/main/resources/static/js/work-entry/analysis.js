document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('analysisForm');
    const resultText = document.getElementById('resultText');

    /**
     * 인증 포함 POST 요청 처리 함수
     * @param {string} url - 요청 URL
     * @param {object} data - 요청 데이터
     * @returns {Promise<Response>} fetch 응답
     */
    function postWithAuth(url, data) {
        return fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }

    /**
     * HTML 텍스트를 타자 애니메이션 효과로 출력
     * @param {HTMLElement} element 출력 대상
     * @param {string} htmlString 마크다운 파싱된 HTML
     */
    function typeHtml(element, htmlString) {
        element.innerHTML = '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        const nodes = [...tempDiv.childNodes];

        let i = 0;
        function typeNext() {
            if (i >= nodes.length) return;
            const node = nodes[i].cloneNode(true);
            element.appendChild(node);
            i++;
            setTimeout(typeNext, 100); // 각 블록 사이 100ms 딜레이
        }
        typeNext();
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const no = document.getElementById('no').value;
        const prompt = document.getElementById('promptText').value;
        const summaryUrl = `http://localhost:10251/api/v1/attendances/summary/recent/${no}`;
        const analysisUrl = 'http://localhost:10251/api/v1/analysis/custom';

        // 분석 중 표시
        let dots = 0;
        resultText.innerHTML = '';
        const loading = setInterval(() => {
            dots = (dots + 1) % 4;
            resultText.innerHTML = `<span class="text-muted">🧠 AI 분석 중입니다${'.'.repeat(dots)}</span>`;
        }, 400);

        fetch(summaryUrl, { method: 'GET', credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error(`출결 데이터 요청 실패 (${res.status})`);
                return res.json();
            })
            .then(attendance => {
                const records = attendance.content.map(r => ({
                    date: `${r.year}-${r.monthValue}-${r.dayOfMonth}`,
                    dayOfWeek: r.dayOfWeek,
                    statusCode: r.code,
                    inTime: r.inTime,
                    outTime: r.outTime
                }));
                return postWithAuth(analysisUrl, { memberNo: no, prompt, workRecords: records });
            })
            .then(res => {
                if (!res.ok) throw new Error(`Gemini 분석 요청 실패 (${res.status})`);
                return res.json();
            })
            .then(data => {
                clearInterval(loading);
                const markdown = data.fullText || "⚠️ AI 분석 결과가 없습니다.";
                const htmlResult = marked.parse(markdown);
                typeHtml(resultText, htmlResult);
            })
            .catch(err => {
                clearInterval(loading);
                resultText.innerHTML = `<span class="text-danger">⚠️ 분석 실패: ${err.message}</span>`;
            });
    });
});
