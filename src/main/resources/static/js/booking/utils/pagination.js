
export function renderPagination(paginationEl, totalPages, currentPage, onPageChange) {
    paginationEl.innerHTML = '';

    const createButton = (text, page, disabled = false, active = false) => {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.disabled = disabled;
        btn.className = `page-btn ${active ? 'active' : ''}`;
        btn.addEventListener('click', () => window.location.search=`page=${page + 1}`);
        return btn;
    };

    paginationEl.appendChild(createButton('이전', currentPage - 1, currentPage === 0));

    for (let i = 0; i < totalPages; i++) {
        paginationEl.appendChild(createButton(i + 1, i, false, i === currentPage));
    }

    paginationEl.appendChild(createButton('다음', currentPage + 1, currentPage === totalPages - 1));
}
