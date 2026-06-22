const userData = {
            admin: {
                name: 'Admin SIAE',
                initials: 'AD',
                role: 'Administrador do Sistema',
                email: 'admin@siae.edu.br',
                phone: '(11) 99999-0000',
                position: 'Administrador',
                sector: 'TI / Gestao',
                stats: { occurrences: 'N/A', shared: 'N/A', students: '1.240' }
            },
            professional: {
                name: 'Dra. Patricia Lima',
                initials: 'PL',
                role: 'Psicologa - Setor de Psicologia',
                email: 'patricia.lima@siae.edu.br',
                phone: '(11) 99999-9999',
                position: 'Psicologa',
                sector: 'Psicologia',
                stats: { occurrences: '45', shared: '23', students: '78' }
            }
        };

        function checkAuth() {
            if (localStorage.getItem('siae_is_logged_in') !== 'true') {
                window.location.href = '../public/login.html';
                return false;
            }
            return true;
        }

        function updateUIByRole() {
            const role = localStorage.getItem('siae_user_role') || 'professional';
            const isAdmin = role === 'admin';
            const data = userData[role];

            // Sidebar
            document.getElementById('userName').textContent = data.name;
            document.getElementById('userRole').textContent = data.position;
            document.getElementById('userAvatar').textContent = data.initials;

            // Header
            document.getElementById('headerName').textContent = data.name.split(' ')[0];
            document.getElementById('headerAvatar').textContent = data.initials;

            // Profile header
            document.getElementById('profileAvatarLarge').textContent = data.initials;
            document.getElementById('profileName').textContent = data.name;
            document.getElementById('profileRole').textContent = data.role;

            // Stats
            document.getElementById('statOcurrence').textContent = data.stats.occurrences;
            document.getElementById('statShared').textContent = data.stats.shared;
            document.getElementById('statStudents').textContent = data.stats.students;

            // Fields
            document.getElementById('fieldName').textContent = data.name;
            document.getElementById('fieldEmail').textContent = data.email;
            document.getElementById('fieldPhone').textContent = data.phone;
            document.getElementById('fieldPosition').textContent = data.position;
            document.getElementById('fieldSector').textContent = data.sector;

            // Role visibility
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? '' : 'none');
            document.querySelectorAll('.professional-only').forEach(el => el.style.display = isAdmin ? 'none' : '');
        }

        function editProfile() {
            alert('Funcionalidade de edicao em desenvolvimento.');
        }

        function saveProfile() {
            alert('Perfil salvo com sucesso!');
        }

        function handleLogout() {
            localStorage.clear();
            window.location.href = '../public/login.html';
        }

        // Initialize
        if (checkAuth()) {
            updateUIByRole();
        }

