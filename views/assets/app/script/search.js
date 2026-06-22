const defaultStudentPhoto = '../assets/app/images/students/default-student.svg';

const students = [
            { id: 1, name: 'Ana Paula Silva', ra: '2024001', class: '1A - Administracao', sector: 'Pedagogico', status: 'active', phone: '(11) 98888-1001', email: 'ana.silva@aluno.siae.edu.br', guardian: 'Marcia Silva', address: 'Rua das Flores, 120', history: [{ date: '12/06/2026', title: 'Orientacao pedagogica', professional: 'Prof. Ricardo Moura', description: 'Acompanhamento de rendimento e combinados de rotina de estudos.' }, { date: '02/05/2026', title: 'Encaminhamento para psicologia', professional: 'Dra. Patricia Lima', description: 'Registro de acolhimento inicial apos relato de ansiedade em avaliacoes.' }] },
            { id: 2, name: 'Bruno Santos', ra: '2024002', class: '2B - Contabilidade', sector: 'Psicologico', status: 'active', phone: '(11) 98888-1002', email: 'bruno.santos@aluno.siae.edu.br', guardian: 'Carlos Santos', address: 'Av. Central, 45', history: [{ date: '10/06/2026', title: 'Atendimento psicologico', professional: 'Dra. Patricia Lima', description: 'Aluno acolhido para acompanhamento emocional e orientacao familiar.' }] },
            { id: 3, name: 'Carla Mendes', ra: '2024003', class: '1A - Recursos Humanos', sector: 'Pedagogico', status: 'inactive', phone: '(11) 98888-1003', email: 'carla.mendes@aluno.siae.edu.br', guardian: 'Renata Mendes', address: 'Rua Aurora, 88', history: [{ date: '28/04/2026', title: 'Plano de frequencia', professional: 'Prof. Ricardo Moura', description: 'Criado plano de acompanhamento por faltas recorrentes.' }] },
            { id: 4, name: 'Diego Lima', ra: '2024004', class: '3C - Marketing', sector: 'Social', status: 'active', phone: '(11) 98888-1004', email: 'diego.lima@aluno.siae.edu.br', guardian: 'Sonia Lima', address: 'Rua Norte, 710', history: [{ date: '15/06/2026', title: 'Avaliacao social', professional: 'Assist. Social Camila Reis', description: 'Solicitada atualizacao cadastral e conversa com responsavel.' }] },
            { id: 5, name: 'Elena Rocha', ra: '2024005', class: '2A - Tecnologia', sector: 'Enfermaria', status: 'active', phone: '(11) 98888-1005', email: 'elena.rocha@aluno.siae.edu.br', guardian: 'Paulo Rocha', address: 'Travessa Azul, 31', history: [{ date: '06/06/2026', title: 'Atendimento na enfermaria', professional: 'Enf. Lucia Barbosa', description: 'Queixa de dor de cabeca. Responsavel comunicado e aluno liberado para sala.' }] },
            { id: 6, name: 'Felipe Costa', ra: '2024006', class: '1B - Logistica', sector: 'Psicologico', status: 'active', phone: '(11) 98888-1006', email: 'felipe.costa@aluno.siae.edu.br', guardian: 'Andre Costa', address: 'Rua do Porto, 53', history: [{ date: '21/05/2026', title: 'Acolhimento', professional: 'Dra. Patricia Lima', description: 'Escuta inicial e agendamento de retorno.' }] },
            { id: 7, name: 'Gabriela Nunes', ra: '2024007', class: '3A - Enfermagem', sector: 'Pedagogico', status: 'active', phone: '(11) 98888-1007', email: 'gabriela.nunes@aluno.siae.edu.br', guardian: 'Luciana Nunes', address: 'Rua Primavera, 66', history: [{ date: '18/05/2026', title: 'Revisao de atividades', professional: 'Prof. Ricardo Moura', description: 'Orientacoes para recuperacao paralela.' }] },
            { id: 8, name: 'Henrique Alves', ra: '2024008', class: '2C - Pedagogia', sector: 'Social', status: 'active', phone: '(11) 98888-1008', email: 'henrique.alves@aluno.siae.edu.br', guardian: 'Marta Alves', address: 'Rua Cedro, 109', history: [{ date: '09/06/2026', title: 'Contato com responsavel', professional: 'Assist. Social Camila Reis', description: 'Alinhado acompanhamento de rotina e documentos pendentes.' }] },
            { id: 9, name: 'Isabela Ferreira', ra: '2024009', class: '1A - Administracao', sector: 'Psicologico', status: 'active', phone: '(11) 98888-1009', email: 'isabela.ferreira@aluno.siae.edu.br', guardian: 'Roberto Ferreira', address: 'Alameda Santos, 19', history: [{ date: '03/06/2026', title: 'Atendimento compartilhado', professional: 'Dra. Patricia Lima', description: 'Caso compartilhado com pedagogico para suporte em sala.' }] },
            { id: 10, name: 'Joao Pedro Martins', ra: '2024010', class: '3B - Contabilidade', sector: 'Enfermaria', status: 'inactive', phone: '(11) 98888-1010', email: 'joao.martins@aluno.siae.edu.br', guardian: 'Fernanda Martins', address: 'Rua Horizonte, 204', history: [{ date: '27/04/2026', title: 'Registro de saude', professional: 'Enf. Lucia Barbosa', description: 'Atualizacao de ficha medica e orientacao para responsavel.' }] },
        ];

        let currentFilter = 'all';

        function checkAuth() {
            if (localStorage.getItem('siae_is_logged_in') !== 'true') { window.location.href = '../public/login.html'; return false; }
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

        function setFilter(filter) {
            currentFilter = filter;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById('filter-' + filter).classList.add('active');
            filterStudents();
        }

        function filterStudents() {
            const query = document.getElementById('searchInput').value.toLowerCase().trim();
            const container = document.getElementById('resultsContainer');

            let filtered = students;

            if (query) {
                filtered = students.filter(student => {
                    switch (currentFilter) {
                        case 'name': return student.name.toLowerCase().includes(query);
                        case 'class': return student.class.toLowerCase().includes(query);
                        case 'ra': return student.ra.toLowerCase().includes(query);
                        default: return student.name.toLowerCase().includes(query) ||
                                       student.class.toLowerCase().includes(query) ||
                                       student.ra.toLowerCase().includes(query);
                    }
                });
            }

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="no-results">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <h3 style="color: var(--text-secondary); margin-bottom: 8px;">Nenhum aluno encontrado</h3>
                        <p style="font-size: 14px;">Tente ajustar os filtros ou termos de busca</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = filtered.map(student => `
                <div class="student-card" onclick="viewStudent(${student.id})">
                    <div class="student-avatar">${renderStudentPhoto(student)}</div>
                    <div class="student-info">
                        <div class="student-name">${student.name}</div>
                        <div class="student-details">
                            <span class="student-detail-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                Turma: ${student.class}
                            </span>
                            <span class="student-detail-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                RA: ${student.ra}
                            </span>
                        </div>
                    </div>
                    <div class="student-badges">
                        <span class="badge badge-primary">${student.sector}</span>
                        <span class="badge ${student.status === 'active' ? 'badge-success' : 'badge-neutral'}">${student.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                    </div>
                </div>
            `).join('');
        }

        function getStudentInitials(name) {
            return name.split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase();
        }

        function renderStudentPhoto(student) {
            const photo = student.photo || defaultStudentPhoto;
            return `<img src="${photo}" alt="Foto de ${student.name}">`;
        }

        function viewStudent(id) {
            const student = students.find(item => item.id === id);
            if (!student) return;

            const initials = getStudentInitials(student.name);
            const photoFrame = document.querySelector('.student-photo-frame');
            const photo = document.getElementById('studentModalPhoto');
            const photoFallback = document.getElementById('studentModalPhotoFallback');

            document.getElementById('studentModalName').textContent = student.name;
            document.getElementById('studentModalSubtitle').textContent = `RA ${student.ra} - ${student.class}`;
            document.getElementById('studentModalProfileName').textContent = student.name;
            document.getElementById('studentModalProfileMeta').textContent = `RA ${student.ra} - ${student.class} - ${student.sector}`;
            photoFrame.classList.remove('is-fallback');
            photo.src = student.photo || defaultStudentPhoto;
            photo.alt = `Foto de ${student.name}`;
            photoFallback.textContent = initials;
            document.getElementById('studentInfoGrid').innerHTML = [
                ['Matricula', student.ra],
                ['Turma', student.class],
                ['Setor responsavel', student.sector],
                ['Status', student.status === 'active' ? 'Ativo' : 'Inativo'],
                ['Telefone', student.phone],
                ['Email', student.email],
                ['Responsavel', student.guardian],
                ['Endereco', student.address],
            ].map(([label, value]) => `<div class="info-item"><div class="info-label">${label}</div><div class="info-value">${value}</div></div>`).join('');

            document.getElementById('studentHistoryList').innerHTML = student.history.map(item => `
                <div class="history-item">
                    <div class="history-item-header">
                        <div>
                            <div class="history-title">${item.title}</div>
                            <div class="info-label">${item.professional}</div>
                        </div>
                        <span class="history-date">${item.date}</span>
                    </div>
                    <div class="history-description">${item.description}</div>
                </div>
            `).join('');

            const modal = document.getElementById('studentDetailsModal');
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeStudentModal() {
            document.getElementById('studentDetailsModal').classList.remove('active');
            document.body.style.overflow = '';
        }

        document.getElementById('studentDetailsModal')?.addEventListener('click', event => {
            if (event.target.id === 'studentDetailsModal') {
                closeStudentModal();
            }
        });

        function handleLogout() {
            localStorage.clear();
            window.location.href = '../public/login.html';
        }

        // Initialize
        if (checkAuth()) {
            updateUIByRole();
            filterStudents();
        }

