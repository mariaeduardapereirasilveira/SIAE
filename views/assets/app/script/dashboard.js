
function checkAuth() {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '../public/login.html';
        return false;
    }

    return true;
}


function updateUIByRole() {
    const role = localStorage.getItem('siae_user_role') || 'professional';
    const isAdmin = role === 'admin';

    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    const headerName = document.getElementById('headerName');
    const headerAvatar = document.getElementById('headerAvatar');

    const name = localStorage.getItem('userName') || 'Usuário';

    if (isAdmin) {
        userName.textContent = name;
        userRole.textContent = 'Administrador';

        userAvatar.textContent = 'AD';
        headerName.textContent = name;
        headerAvatar.textContent = 'AD';

    } else {
        userName.textContent = name;
        userRole.textContent = 'Profissional';

        userAvatar.textContent = name.substring(0, 2).toUpperCase();
        headerName.textContent = name;
        headerAvatar.textContent = name.substring(0, 2).toUpperCase();
    }

    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
    });

    document.querySelectorAll('.professional-only').forEach(el => {
        el.style.display = isAdmin ? 'none' : '';
    });
}


function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('siae_user_role');

    window.location.href = '../public/login.html';
}


if (checkAuth()) {
    updateUIByRole();
}