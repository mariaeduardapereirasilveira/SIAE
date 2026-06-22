function checkAuth() { if (localStorage.getItem('siae_is_logged_in') !== 'true') { window.location.href = '../public/login.html'; return false; } const role = localStorage.getItem('siae_user_role'); if (role !== 'admin') { window.location.href = '../app/dashboard.html'; return false; } return true; }
        function openModal(id) { document.getElementById(id).classList.add('active'); document.body.style.overflow = 'hidden'; }
        function closeModal(id) { document.getElementById(id).classList.remove('active'); document.body.style.overflow = ''; }

        function saveProfessional() {
            const name = document.getElementById('profName').value;
            const func = document.getElementById('profFunction').value;
            const sector = document.getElementById('profSector').value;
            const email = document.getElementById('profEmail').value;
            if (name && email) {
                const table = document.getElementById('professionalsTable');
                const row = document.createElement('tr');
                const sectorBadge = sector === 'Psicologico' ? 'badge-info' : (sector === 'Pedagogico' ? 'badge-primary' : (sector === 'Enfermaria' ? 'badge-danger' : 'badge-success'));
                row.innerHTML = `<td style="font-weight: 600;">${name}</td><td>${func}</td><td><span class="badge ${sectorBadge}">${sector}</span></td><td style="color: var(--text-muted);">${email}</td><td><span class="badge badge-success">Ativo</span></td><td><button class="btn btn-ghost btn-sm">Editar</button></td>`;
                table.appendChild(row);
                closeModal('professionalModal');
                document.getElementById('profName').value = '';
                document.getElementById('profEmail').value = '';
            }
        }

        function handleLogout() { localStorage.clear(); window.location.href = '../public/login.html'; }
        checkAuth();

