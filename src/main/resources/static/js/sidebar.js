document.addEventListener('DOMContentLoaded', function () {
    // Font Awesome CSS 추가
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(fontAwesome);

    // Google 폰트 추가
    const googleFonts = document.createElement('link');
    googleFonts.rel = 'stylesheet';
    googleFonts.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap';
    document.head.appendChild(googleFonts);

    // 사이드바 메뉴 아이템에 아이콘 추가
    const navLinks = document.querySelectorAll('.sidebar .nav-item');
    const icons = ['fas fa-tachometer-alt', 'fas fa-desktop', 'fas fa-users', 'fas fa-comments', 'fas fa-bell'];

    navLinks.forEach((link, index) => {
        const anchor = link.querySelector('a');
        const icon = document.createElement('i');
        icon.className = icons[index] + ' menu-icon';
        anchor.insertBefore(icon, anchor.firstChild);

        // 드롭다운 메뉴 설정
        if (index >= 0) { // Dashboard와 UI Features에만 드롭다운 추가
            anchor.classList.add('dropdown-indicator');

            // 드롭다운 메뉴 생성
            const dropdownMenu = document.createElement('ul');
            dropdownMenu.className = 'sidebar-dropdown-menu';

            // 메뉴 아이템 뒤에 드롭다운 메뉴 추가
            link.appendChild(dropdownMenu);

            // 클릭 이벤트 설정
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                link.classList.toggle('expanded');
                dropdownMenu.classList.toggle('show');
            });
        }
    });

    // 사용자 드롭다운 메뉴 설정
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        const userImage = document.createElement('img');
        userImage.src = '/images/user.JPG';
        userImage.alt = 'User Image';
        userImage.width = 30;
        userImage.height = 30;
        userImage.className = 'rounded-circle me-2';

        // 사용자 이름 앞에 이미지 추가
        userDropdown.prepend(userImage);
    }
});
