// Check if user is logged in
        function checkAuth() {
            const isLoggedIn = localStorage.getItem('siae_is_logged_in');
            if (isLoggedIn !== 'true') {
                window.location.href = '../public/login.html';
                return false;
            }
            return true;
        }

        // Update UI based on user role
        function updateUIByRole() {
            const role = localStorage.getItem('siae_user_role') || 'professional';
            const isAdmin = role === 'admin';

            // Update user info
            const userName = document.getElementById('userName');
            const userRole = document.getElementById('userRole');
            const userAvatar = document.getElementById('userAvatar');
            const headerName = document.getElementById('headerName');
            const headerAvatar = document.getElementById('headerAvatar');

            if (isAdmin) {
                userName.textContent = 'Admin SIAE';
                userRole.textContent = 'Administrador';
                userAvatar.textContent = 'AD';
                headerName.textContent = 'Admin';
                headerAvatar.textContent = 'AD';
            } else {
                userName.textContent = 'Dra. Patricia Lima';
                userRole.textContent = 'Psicologa';
                userAvatar.textContent = 'PL';
                headerName.textContent = 'Patricia';
                headerAvatar.textContent = 'PL';
            }

            // Show/hide admin-only elements
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = isAdmin ? '' : 'none';
            });

            // Show/hide professional-only elements
            document.querySelectorAll('.professional-only').forEach(el => {
                el.style.display = isAdmin ? 'none' : '';
            });
        }

        function handleLogout() {
            localStorage.removeItem('siae_is_logged_in');
            localStorage.removeItem('siae_user_role');
            window.location.href = '../public/login.html';
        }

        // Initialize
        if (checkAuth()) {
            updateUIByRole();
        }

