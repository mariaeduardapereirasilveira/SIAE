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
            // const role = localStorage.getItem('enrollment') || 'professional';
            // const isAdmin = role === 'admin';
            document.getElementById('userName').textContent =  'Dra. Patricia Lima';
            document.getElementById('userRole').textContent =  'Psicologa';
            document.getElementById('userAvatar').textContent =  'PL';
            document.getElementById('headerName').textContent = 'Patricia';
            document.getElementById('headerAvatar').textContent = 'PL';
            document.querySelectorAll('.admin-only').forEach(el => el.style.display =  'none');
            document.querySelectorAll('.professional-only').forEach(el => el.style.display = 'none');
        }
        function handleLogout() { localStorage.clear(); window.location.href = '../public/login.html'; }
        if (checkAuth()) updateUIByRole();

