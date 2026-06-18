function checkAuth() { if (localStorage.getItem('siae_is_logged_in') !== 'true') { window.location.href = '../public/login.html'; return false; } const role = localStorage.getItem('siae_user_role'); if (role !== 'admin') { window.location.href = '../app/dashboard.html'; return false; } return true; }
        function openModal(id) { document.getElementById(id).classList.add('active'); document.body.style.overflow = 'hidden'; }
        function closeModal(id) { document.getElementById(id).classList.remove('active'); document.body.style.overflow = ''; }

        function saveStudent() {
            const name = document.getElementById('studentName').value;
            const ra = document.getElementById('studentRA').value;
            const studentClass = document.getElementById('studentClass').value;
            const sector = document.getElementById('studentSector').value;
            const status = document.getElementById('studentStatus').value;
            if (name && ra) {
                const table = document.getElementById('studentsTable');
                const row = document.createElement('tr');
                row.innerHTML = `<td style="font-weight: 600;">${name}</td><td style="color: var(--text-muted);">${ra}</td><td>${studentClass}</td><td><span class="badge badge-primary">${sector}</span></td><td><span class="badge ${status === 'active' ? 'badge-success' : 'badge-neutral'}">${status === 'active' ? 'Ativo' : 'Inativo'}</span></td><td><button class="btn btn-ghost btn-sm" onclick="editStudent('${name}')">Editar</button></td>`;
                table.appendChild(row);
                closeModal('studentModal');
                document.getElementById('studentName').value = '';
                document.getElementById('studentRA').value = '';
            }
        }

        function editStudent(name) { alert('Editar aluno: ' + name); }
        function handleLogout() { localStorage.clear(); window.location.href = '../public/login.html'; }
        checkAuth();

