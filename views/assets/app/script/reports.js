const currentProfessionalName = 'Dra. Patricia Lima';
const currentProfessionalSector = 'Psicologia';

const initialReports = [
    {
        id: 1,
        title: 'Acompanhamento emocional do 2B',
        content: 'Resumo dos atendimentos psicologicos realizados com alunos do 2B no mes atual.',
        creator: 'Dra. Patricia Lima',
        sector: 'Psicologia',
        date: '17/06/2026'
    },
    {
        id: 2,
        title: 'Rendimento e rotina de estudos',
        content: 'Relatorio pedagogico sobre frequencia, entregas pendentes e combinados de estudo.',
        creator: 'Prof. Ricardo Moura',
        sector: 'Pedagogico',
        date: '14/06/2026'
    },
    {
        id: 3,
        title: 'Atendimentos de enfermaria',
        content: 'Consolidado de queixas, encaminhamentos e comunicacoes com responsaveis.',
        creator: 'Enf. Lucia Barbosa',
        sector: 'Enfermaria',
        date: '12/06/2026'
    },
    {
        id: 4,
        title: 'Atualizacao cadastral social',
        content: 'Levantamento de documentos pendentes e necessidades familiares identificadas.',
        creator: 'Assist. Social Camila Reis',
        sector: 'Social',
        date: '10/06/2026'
    }
];

let reports = JSON.parse(localStorage.getItem('siae_reports') || 'null') || initialReports;
let editingReportId = null;

function checkAuth() {
    if (localStorage.getItem('siae_is_logged_in') !== 'true') {
        window.location.href = '../public/login.html';
        return false;
    }
    return true;
}

function getCurrentRole() {
    return localStorage.getItem('siae_user_role') || 'professional';
}

function updateUIByRole() {
    const role = getCurrentRole();
    const isAdmin = role === 'admin';

    document.getElementById('userName').textContent = isAdmin ? 'Admin SIAE' : currentProfessionalName;
    document.getElementById('userRole').textContent = isAdmin ? 'Administrador' : 'Psicologa';
    document.getElementById('userAvatar').textContent = isAdmin ? 'AD' : 'PL';
    document.getElementById('headerName').textContent = isAdmin ? 'Admin' : 'Patricia';
    document.getElementById('headerAvatar').textContent = isAdmin ? 'AD' : 'PL';

    document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? '' : 'none');
    document.querySelectorAll('.professional-only').forEach(el => el.style.display = isAdmin ? 'none' : '');

    document.getElementById('reportsSubtitle').textContent = isAdmin
        ? 'Visualize os relatorios criados por setor e profissional'
        : 'Visualize seus relatorios e crie novos registros';
}

function saveReports() {
    localStorage.setItem('siae_reports', JSON.stringify(reports));
}

function getVisibleReports() {
    if (getCurrentRole() === 'admin') return reports;
    return reports.filter(report => report.creator === currentProfessionalName);
}

function renderReports() {
    const container = document.getElementById('reportsList');
    const visibleReports = getVisibleReports();

    if (visibleReports.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <h3>Nenhum relatorio encontrado</h3>
                <p>Crie um novo relatorio para ele aparecer aqui.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = visibleReports.map(report => `
        <article class="report-item" onclick="viewReport(${report.id})" tabindex="0" role="button" onkeydown="handleReportKeydown(event, ${report.id})">
            <div class="report-icon">${getSectorInitial(report.sector)}</div>
            <div class="report-content">
                <div class="report-head">
                    <div>
                        <h3>${report.title}</h3>
                        <p>${report.content}</p>
                    </div>
                    <span class="badge badge-primary">${report.sector}</span>
                </div>
                <div class="report-meta">
                    <span>Criado por ${report.creator}</span>
                    <span>${report.date}</span>
                </div>
            </div>
        </article>
    `).join('');
}

function handleReportKeydown(event, id) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        viewReport(id);
    }
}

function viewReport(id) {
    const report = reports.find(item => item.id === id);
    if (!report) return;

    document.getElementById('viewReportTitle').textContent = report.title;
    document.getElementById('viewReportContent').textContent = report.content;
    document.getElementById('viewReportCreator').textContent = report.creator;
    document.getElementById('viewReportSector').textContent = report.sector;
    document.getElementById('viewReportDate').textContent = report.date;
    document.getElementById('viewReportModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function getSectorInitial(sector) {
    return sector.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
}

function openReportModal() {
    editingReportId = null;
    document.getElementById('reportModalTitle').textContent = 'Criar relatorio';
    document.getElementById('reportTitle').value = '';
    document.getElementById('reportContent').value = '';
    document.getElementById('reportCreator').value = currentProfessionalName;
    document.getElementById('reportSector').value = currentProfessionalSector;
    document.getElementById('reportModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}

function saveReport() {
    const title = document.getElementById('reportTitle').value.trim();
    const content = document.getElementById('reportContent').value.trim();
    const creator = document.getElementById('reportCreator').value.trim();
    const sector = document.getElementById('reportSector').value;

    if (!title || !content || !creator || !sector) {
        alert('Preencha todos os campos do relatorio.');
        return;
    }

    const report = {
        id: Date.now(),
        title,
        content,
        creator,
        sector,
        date: new Date().toLocaleDateString('pt-BR')
    };

    reports.unshift(report);
    saveReports();
    renderReports();
    closeModal('reportModal');
}

function handleLogout() {
    localStorage.clear();
    window.location.href = '../public/login.html';
}

document.getElementById('reportModal')?.addEventListener('click', event => {
    if (event.target.id === 'reportModal') closeModal('reportModal');
});

document.getElementById('viewReportModal')?.addEventListener('click', event => {
    if (event.target.id === 'viewReportModal') closeModal('viewReportModal');
});

if (checkAuth()) {
    updateUIByRole();
    renderReports();
}
