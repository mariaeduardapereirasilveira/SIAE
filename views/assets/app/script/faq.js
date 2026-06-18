const initialFaqs = [
    {
        id: 1,
        question: 'Como registrar um novo atendimento?',
        answer: 'Acesse a pagina "Minhas Ocorrencias" e clique no botao "Nova Ocorrencia". Preencha os campos obrigatorios como aluno, tipo de atendimento e descricao. Ao finalizar, clique em "Salvar".'
    },
    {
        id: 2,
        question: 'Como compartilhar uma ocorrencia com outro profissional?',
        answer: 'Na lista de ocorrencias, clique em "Compartilhar" na ocorrencia desejada. Selecione os profissionais com quem deseja compartilhar e confirme.'
    },
    {
        id: 3,
        question: 'Como buscar informacoes de um aluno?',
        answer: 'Acesse a pagina "Busca" no menu lateral. Voce pode buscar por nome do aluno, turma ou matricula (RA). Use os filtros para refinar sua pesquisa.'
    },
    {
        id: 4,
        question: 'Quem pode ver as ocorrencias que eu criei?',
        answer: 'Apenas voce e os profissionais com quem voce compartilhou a ocorrencia podem visualiza-la. Administradores tambem tem acesso a todas as ocorrencias para fins de gestao.'
    },
    {
        id: 5,
        question: 'Como gerar relatorios?',
        answer: 'Acesse a pagina "Relatorios" no menu lateral. Profissionais podem criar relatorios dos seus atendimentos, e administradores podem visualizar os relatorios criados por todos os setores.'
    },
    {
        id: 6,
        question: 'Como alterar minhas informacoes de perfil?',
        answer: 'Clique no seu avatar no canto superior direito ou no menu lateral para acessar seu perfil. Clique em "Editar Perfil" para alterar suas informacoes.'
    }
];

let faqs = JSON.parse(localStorage.getItem('siae_faqs') || 'null') || initialFaqs;
let editingFaqId = null;

function checkAuth() {
    if (localStorage.getItem('siae_is_logged_in') !== 'true') {
        window.location.href = '../public/login.html';
        return false;
    }
    return true;
}

function isAdminUser() {
    return (localStorage.getItem('siae_user_role') || 'professional') === 'admin';
}

function updateUIByRole() {
    const isAdmin = isAdminUser();
    document.body.classList.toggle('is-admin', isAdmin);
    document.getElementById('userName').textContent = isAdmin ? 'Admin SIAE' : 'Dra. Patricia Lima';
    document.getElementById('userRole').textContent = isAdmin ? 'Administrador' : 'Psicologa';
    document.getElementById('userAvatar').textContent = isAdmin ? 'AD' : 'PL';
    document.getElementById('headerName').textContent = isAdmin ? 'Admin' : 'Patricia';
    document.getElementById('headerAvatar').textContent = isAdmin ? 'AD' : 'PL';
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? '' : 'none');
    document.querySelectorAll('.professional-only').forEach(el => el.style.display = isAdmin ? 'none' : '');
}

function saveFaqs() {
    localStorage.setItem('siae_faqs', JSON.stringify(faqs));
}

function renderFAQs() {
    const container = document.getElementById('faqContainer');
    const actions = isAdminUser()
        ? faq => `
            <div class="faq-actions">
                <button class="btn btn-ghost btn-sm" onclick="editFAQ(${faq.id})">Editar</button>
                <button class="btn btn-ghost btn-sm faq-delete-btn" onclick="deleteFAQ(${faq.id})">Excluir</button>
            </div>
        `
        : () => '';

    container.innerHTML = faqs.map(faq => `
        <div class="accordion-item">
            <div class="accordion-header" onclick="toggleAccordion(this)">
                <span>${faq.question}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="accordion-content">
                <p>${faq.answer}</p>
                ${actions(faq)}
            </div>
        </div>
    `).join('');
}

function toggleAccordion(header) {
    const item = header.parentElement;
    const content = header.nextElementSibling;
    const isOpen = item.classList.contains('active');

    document.querySelectorAll('.accordion-item').forEach(el => {
        el.classList.remove('active');
        el.querySelector('.accordion-content').style.maxHeight = '0px';
    });

    if (!isOpen) {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
    }
}

function openAddFAQModal() {
    editingFaqId = null;
    document.getElementById('faqModalTitle').textContent = 'Adicionar Nova Pergunta';
    document.getElementById('questionInput').value = '';
    document.getElementById('answerInput').value = '';
    openModal('faqModal');
}

function editFAQ(id) {
    const faq = faqs.find(item => item.id === id);
    if (!faq) return;

    editingFaqId = id;
    document.getElementById('faqModalTitle').textContent = 'Editar Pergunta';
    document.getElementById('questionInput').value = faq.question;
    document.getElementById('answerInput').value = faq.answer;
    openModal('faqModal');
}

function deleteFAQ(id) {
    if (!confirm('Deseja excluir esta pergunta?')) return;
    faqs = faqs.filter(item => item.id !== id);
    saveFaqs();
    renderFAQs();
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    document.body.style.overflow = '';
}

function saveFAQ() {
    const question = document.getElementById('questionInput').value.trim();
    const answer = document.getElementById('answerInput').value.trim();

    if (!question || !answer) {
        alert('Preencha a pergunta e a resposta.');
        return;
    }

    if (editingFaqId) {
        const faq = faqs.find(item => item.id === editingFaqId);
        if (faq) {
            faq.question = question;
            faq.answer = answer;
        }
    } else {
        faqs.push({
            id: Date.now(),
            question,
            answer
        });
    }

    saveFaqs();
    renderFAQs();
    closeModal('faqModal');
}

function handleLogout() {
    localStorage.clear();
    window.location.href = '../public/login.html';
}

document.getElementById('faqModal')?.addEventListener('click', event => {
    if (event.target.id === 'faqModal') closeModal('faqModal');
});

if (checkAuth()) {
    updateUIByRole();
    renderFAQs();
}
