/**
 * SIAE - Sistema Integrado de Apoio Educacional
 * App Scripts - Logged Area
 */

(function() {
    'use strict';

    // ============================================
    // User Role Simulation
    // ============================================

    // Simulated user data (would come from server in real app)
    const simulatedUser = {
        name: 'Admin SIAE',
        role: 'professional', // 'professional' or 'admin'
        initials: 'AD'
    };

    /**
     * Toggle admin role (for testing purposes)
     */
    function toggleAdminRole() {
        const toggle = document.getElementById('adminToggle');
        if (!toggle) return;

        simulatedUser.role = toggle.checked ? 'admin' : 'professional';
        updateUIForRole();

        // Save to localStorage for persistence
        localStorage.setItem('siae_user_role', simulatedUser.role);
    }

    /**
     * Update UI elements based on user role
     */
    function updateUIForRole() {
        const body = document.body;
        const roleLabel = document.getElementById('roleLabel');

        if (simulatedUser.role === 'admin') {
            body.classList.add('is-admin');
            if (roleLabel) roleLabel.textContent = 'Administrador';
        } else {
            body.classList.remove('is-admin');
            if (roleLabel) roleLabel.textContent = 'Profissional';
        }
    }

    /**
     * Initialize role from localStorage
     */
    function initializeRole() {
        const savedRole = localStorage.getItem('siae_user_role');
        if (savedRole) {
            simulatedUser.role = savedRole;
        }

        const toggle = document.getElementById('adminToggle');
        if (toggle) {
            toggle.checked = simulatedUser.role === 'admin';
            toggle.addEventListener('change', toggleAdminRole);
        }

        updateUIForRole();
    }

    // ============================================
    // FAQ Accordion
    // ============================================

    const faqData = [
        {
            id: 1,
            question: 'Como faÃƒÂ§o para cadastrar um novo aluno no sistema?',
            answer: 'Para cadastrar um novo aluno, acesse o menu "Alunos" na barra lateral e clique no botÃƒÂ£o "Novo Aluno". Preencha os dados solicitados como nome, RA (Registro do Aluno), curso, setor responsÃƒÂ¡vel e informaÃƒÂ§ÃƒÂµes de contato. ApÃƒÂ³s preencher todos os campos obrigatÃƒÂ³rios, clique em "Cadastrar" para salvar.'
        },
        {
            id: 2,
            question: 'Como registrar um atendimento de enfermagem?',
            answer: 'Acesse o setor "Enfermaria" e selecione "Novo Atendimento". Busque o aluno pelo nome ou RA, preencha as informaÃƒÂ§ÃƒÂµes do atendimento como tipo de ocorrÃƒÂªncia, descriÃƒÂ§ÃƒÂ£o, medicamentos administrados (se houver) e encaminhamentos. O sistema salva automaticamente e notifica os setores relacionados.'
        },
        {
            id: 3,
            question: 'Posso visualizar o histÃƒÂ³rico completo de um aluno?',
            answer: 'Sim! O SIAE centraliza todas as informaÃƒÂ§ÃƒÂµes do aluno. Acesse "Alunos", busque pelo nome ou RA, e clique no ÃƒÂ­cone de visualizaÃƒÂ§ÃƒÂ£o. VocÃƒÂª terÃƒÂ¡ acesso a todo o histÃƒÂ³rico de atendimentos, encaminhamentos, ocorrÃƒÂªncias e acompanhamentos de todos os setores.'
        },
        {
            id: 4,
            question: 'Como gerar relatÃƒÂ³rios de atendimentos?',
            answer: 'No menu "RelatÃƒÂ³rios", vocÃƒÂª encontra vÃƒÂ¡rias opÃƒÂ§ÃƒÂµes de relatÃƒÂ³rios prÃƒÂ©-configurados. Selecione o perÃƒÂ­odo desejado, os setores envolvidos e o tipo de relatÃƒÂ³rio. O sistema gera automaticamente em PDF ou Excel. Administradores tambÃƒÂ©m podem criar relatÃƒÂ³rios personalizados.'
        },
        {
            id: 5,
            question: 'O sistema permite integraÃƒÂ§ÃƒÂ£o entre setores?',
            answer: 'Sim, essa ÃƒÂ© uma das principais funcionalidades do SIAE. Quando vocÃƒÂª registra um atendimento ou encaminhamento, o sistema notifica automaticamente os profissionais dos setores relacionados. Todo o histÃƒÂ³rico fica centralizado e acessÃƒÂ­vel para toda a equipe multidisciplinar.'
        },
        {
            id: 6,
            question: 'Como funcionam as permissÃƒÂµes de acesso?',
            answer: 'O SIAE possui nÃƒÂ­veis de acesso configurÃƒÂ¡veis. Profissionais podem acessar apenas seus setores e alunos designados. Coordenadores tÃƒÂªm acesso a todo o setor. Administradores tÃƒÂªm acesso completo a todas as funcionalidades, incluindo configuraÃƒÂ§ÃƒÂµes e gestÃƒÂ£o de usuÃƒÂ¡rios.'
        }
    ];

    /**
     * Render FAQ items
     */
    function renderFAQ() {
        const container = document.getElementById('faqContainer');
        if (!container) return;

        container.innerHTML = faqData.map(item => `
            <div class="accordion-item" data-id="${item.id}">
                <div class="accordion-header" onclick="toggleAccordion(${item.id})">
                    <span class="accordion-title">${item.question}</span>
                    <div class="accordion-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </div>
                </div>
                <div class="accordion-content">
                    <div class="accordion-body">
                        ${item.answer}
                    </div>
                </div>
                <div class="accordion-actions">
                    <button class="btn btn-ghost btn-sm" onclick="editFAQ(${item.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Editar
                    </button>
                    <button class="btn btn-ghost btn-sm" style="color: var(--danger);" onclick="deleteFAQ(${item.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Excluir
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Toggle accordion item
     */
    window.toggleAccordion = function(id) {
        const item = document.querySelector(`.accordion-item[data-id="${id}"]`);
        if (!item) return;

        // Close other items
        document.querySelectorAll('.accordion-item.active').forEach(el => {
            if (el !== item) el.classList.remove('active');
        });

        item.classList.toggle('active');
    };

    // ============================================
    // FAQ CRUD Operations (Admin)
    // ============================================

    /**
     * Open modal for adding new FAQ
     */
    window.openAddFAQModal = function() {
        const modal = document.getElementById('faqModal');
        const modalTitle = document.getElementById('modalTitle');
        const questionInput = document.getElementById('questionInput');
        const answerInput = document.getElementById('answerInput');
        const saveBtn = document.getElementById('saveBtn');

        if (!modal) return;

        modalTitle.textContent = 'Adicionar Nova Pergunta';
        questionInput.value = '';
        answerInput.value = '';
        saveBtn.onclick = () => saveNewFAQ();

        openModal('faqModal');
    };

    /**
     * Edit existing FAQ
     */
    window.editFAQ = function(id) {
        const item = faqData.find(f => f.id === id);
        if (!item) return;

        const modal = document.getElementById('faqModal');
        const modalTitle = document.getElementById('modalTitle');
        const questionInput = document.getElementById('questionInput');
        const answerInput = document.getElementById('answerInput');
        const saveBtn = document.getElementById('saveBtn');

        modalTitle.textContent = 'Editar Pergunta';
        questionInput.value = item.question;
        answerInput.value = item.answer;
        saveBtn.onclick = () => updateFAQ(id);

        openModal('faqModal');
    };

    /**
     * Save new FAQ
     */
    function saveNewFAQ() {
        const questionInput = document.getElementById('questionInput');
        const answerInput = document.getElementById('answerInput');

        if (!questionInput.value.trim() || !answerInput.value.trim()) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const newId = Math.max(...faqData.map(f => f.id)) + 1;
        faqData.push({
            id: newId,
            question: questionInput.value.trim(),
            answer: answerInput.value.trim()
        });

        closeModal('faqModal');
        renderFAQ();
        showNotification('Pergunta adicionada com sucesso!', 'success');
    }

    /**
     * Update existing FAQ
     */
    function updateFAQ(id) {
        const item = faqData.find(f => f.id === id);
        if (!item) return;

        const questionInput = document.getElementById('questionInput');
        const answerInput = document.getElementById('answerInput');

        if (!questionInput.value.trim() || !answerInput.value.trim()) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        item.question = questionInput.value.trim();
        item.answer = answerInput.value.trim();

        closeModal('faqModal');
        renderFAQ();
        showNotification('Pergunta atualizada com sucesso!', 'success');
    }

    /**
     * Delete FAQ
     */
    window.deleteFAQ = function(id) {
        if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return;

        const index = faqData.findIndex(f => f.id === id);
        if (index > -1) {
            faqData.splice(index, 1);
            renderFAQ();
            showNotification('Pergunta excluida com sucesso!', 'success');
        }
    };

    // ============================================
    // Modal Functions
    // ============================================

    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // Close modal when clicking overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // ============================================
    // Notification Toast
    // ============================================

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">Ãƒâ€”</button>
        `;

        // Add notification styles if not exists
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    padding: 14px 20px;
                    border-radius: var(--radius-md);
                    background: var(--surface);
                    box-shadow: var(--shadow-lg);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 300;
                    animation: slideUp 0.3s ease;
                }
                .notification-success {
                    border-left: 4px solid var(--success);
                }
                .notification-error {
                    border-left: 4px solid var(--danger);
                }
                .notification button {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: var(--text-muted);
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // ============================================
    // Sidebar Toggle (Mobile)
    // ============================================

    function initSidebarToggle() {
        const toggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');

        if (toggle && sidebar) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
    }

    // ============================================
    // Initialize
    // ============================================

    document.addEventListener('DOMContentLoaded', function() {
        initializeRole();
        renderFAQ();
        initSidebarToggle();
    });

})();
