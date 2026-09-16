function checkAuth() {
    const token= localStorage.getItem('token');
    const enrollment= localStorage.getItem('enrollment');

    if ( !token) {
        window.location.href = '../public/login.html'; 
        return false;
    }


    // if (enrollment !== 'admin') {
    //     window.location.href = '../app/dashboard.html'; 
    //     return false;
    // } 
    return true;
}
        function updateUIByRole() {
            const role = localStorage.getItem('siae_user_role') || 'professional';
            const isAdmin = role === 'admin';
            document.getElementById('userName').textContent = isAdmin ? 'Admin SIAE' : 'Dra. Patricia Lima';
            document.getElementById('userRole').textContent = isAdmin ? 'Administrador' : 'Psicologa';
            document.getElementById('userAvatar').textContent = isAdmin ? 'AD' : 'PL';
            document.getElementById('headerName').textContent = isAdmin ? 'Admin' : 'Patricia';
            document.getElementById('headerAvatar').textContent = isAdmin ? 'AD' : 'PL';
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? '' : 'none');
            document.querySelectorAll('.professional-only').forEach(el => el.style.display = isAdmin ? 'none' : '');
        }
        function handleLogout() { localStorage.clear(); window.location.href = '../public/login.html'; }
        if (checkAuth()) updateUIByRole();

