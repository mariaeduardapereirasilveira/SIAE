// ============================================================
// SIAE — Área administrativa
// ============================================================

// Alternância entre abas (Alunos / Profissionais / Setores)
const adminTabs = document.querySelectorAll("[data-admin-tab]");
const adminPanels = document.querySelectorAll("[data-admin-panel]");

adminTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.getAttribute("data-admin-tab");
    adminTabs.forEach((t) => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    adminPanels.forEach((panel) => {
      const id = panel.getAttribute("data-admin-panel");
      panel.hidden = id !== target;
    });
  });
});


// Modal para formulários administrativos
const adminFormCard = document.querySelector('.admin-form-card');
const adminNewButton = document.querySelector('.page-header .btn-primary');

if (adminFormCard && adminNewButton) {
  const overlay = document.createElement('div');
  overlay.className = 'admin-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'admin-modal';

  const closeButton = document.createElement('button');
  closeButton.className = 'admin-modal-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Fechar modal');
  closeButton.innerHTML = '&times;';

  const modalHeader = document.createElement('div');
  modalHeader.className = 'admin-modal-header';

  const modalTitle = adminFormCard.querySelector('.card-title')?.textContent || 'Novo cadastro';
  modalHeader.innerHTML = `<h2 class="card-title">${modalTitle}</h2>`;
  modalHeader.appendChild(closeButton);

  adminFormCard.querySelector('.card-header')?.remove();

  modal.appendChild(adminFormCard);
  adminFormCard.prepend(modalHeader);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const openModal = () => {
    overlay.classList.add('is-open');
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    overlay.classList.remove('is-open');
    document.body.classList.remove('modal-open');
  };

  adminNewButton.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeModal();
    }
  });
}
