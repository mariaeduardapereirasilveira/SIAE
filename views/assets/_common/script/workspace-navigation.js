function resolveSiaeApiBase() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const projectPrefix = parts.length ? `/${parts[0]}` : "";
  return `${window.location.origin}${projectPrefix}/api`;
}

/* Mantém a navegação por perfil e sincroniza nome/foto do usuário autenticado. */
(() => {
  'use strict';

  const API_BASE = resolveSiaeApiBase();
  const token = (() => { try { return localStorage.getItem('token') || ''; } catch (_) { return ''; } })();
  let role = '';
  try {
    role = (localStorage.getItem('enrollment') || localStorage.getItem('siae_user_role') || localStorage.getItem('siae_role') || '').trim().toLowerCase();
  } catch (_) {}

  const isAdminRole = value => ['admin', 'administrator', 'administrador'].includes(String(value || '').trim().toLowerCase());
  const isProfessionalRole = value => ['professional', 'profissional', 'profissional de saúde', 'profissional da saúde'].includes(String(value || '').trim().toLowerCase());
  const roleLabel = value => isAdminRole(value) ? 'Administrador' : isProfessionalRole(value) ? 'Profissional' : (value || 'Usuário');
  const initials = name => String(name || 'Usuário').trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || 'US';



  // Define quais perfis podem acessar cada página.
  const PAGE_ACCESS = {
    // Páginas administrativas
    '/admin/admin.html': ['admin'],
    '/admin/notifications.html': ['admin'],
    '/admin/professionals.html': ['admin'],
    '/admin/reports.html': ['admin'],
    '/admin/sectors.html': ['admin'],
    '/admin/services.html': ['admin'],
    '/admin/students.html': ['admin'],

    // Páginas exclusivas dos profissionais
    '/app/appointments.html': ['professional'],
    '/app/dashboard.html': ['professional'],
    '/app/occurrences.html': ['professional'],
    '/app/student-documents.html': ['professional'],
    '/app/student-history.html': ['professional'],

    // Páginas compartilhadas
    '/app/charts.html': ['admin', 'professional'],
    '/app/faq.html': ['admin', 'professional'],
    '/app/notifications.html': ['admin', 'professional'],
    '/app/profile.html': ['admin', 'professional'],
    '/app/reports.html': ['admin', 'professional'],
    '/app/search.html': ['admin', 'professional'],
    '/app/student-details.html': ['admin', 'professional']
  };

  const roleType = isAdminRole(role)
    ? 'admin'
    : isProfessionalRole(role)
      ? 'professional'
      : '';

  function getViewPage(url) {
    try {
      const pathname = new URL(url, window.location.href).pathname;
      const marker = '/views/';
      const index = pathname.lastIndexOf(marker);

      return index === -1
        ? ''
        : pathname.slice(index + '/views'.length);
    } catch (_) {
      return '';
    }
  }

  const currentPage = getViewPage(window.location.href);
  const viewIndex = window.location.pathname.lastIndexOf('/views/');
  const projectRoot = viewIndex >= 0
    ? window.location.pathname.slice(0, viewIndex)
    : '';

  const loginUrl = `${projectRoot}/views/public/login.html`;

  const homeUrl = roleType === 'admin'
    ? `${projectRoot}/views/admin/admin.html`
    : `${projectRoot}/views/app/dashboard.html`;

  // Impede acesso direto a páginas sem autorização.
  if (Object.prototype.hasOwnProperty.call(PAGE_ACCESS, currentPage)) {
    if (!token || !roleType) {
      window.location.replace(loginUrl);
      return;
    }

    if (!PAGE_ACCESS[currentPage].includes(roleType)) {
      window.location.replace(homeUrl);
      return;
    }
  }




  function resolvePhotoUrl(photo) {
    if (!photo || typeof photo !== 'string') return '';
    const normalized = photo.trim().replace(/\\/g, '/');
    let path = normalized;
    if (/^https?:\/\//i.test(normalized)) {
      try { path = new URL(normalized).pathname; } catch (_) { return ''; }
    }
    path = path.split(/[?#]/, 1)[0];
    const match = path.match(/(?:^|\/)uploads\/users\/([a-f0-9]{32}\.(?:jpg|png|webp))$/i)
      || path.match(/^([a-f0-9]{32}\.(?:jpg|png|webp))$/i);
    if (!match) return '';
    const siteBase = new URL('../', `${API_BASE}/`);
    return new URL(`uploads/users/${match[1]}`, siteBase).href;
  }

  function renderAvatar(element, name, photo) {
    if (!element) return;
    element.textContent = initials(name);
    element.setAttribute('aria-label', `Foto de ${name || 'usuário'}`);
    element.classList.toggle('has-user-photo', Boolean(photo));
    const imageUrl = resolvePhotoUrl(photo);
    if (!imageUrl) return;

    const image = document.createElement('img');
    image.className = 'user-avatar-image';
    image.alt = '';
    image.decoding = 'async';
    image.loading = 'lazy';
    image.src = imageUrl;
    image.addEventListener('error', () => {
      image.remove();
      element.classList.remove('has-user-photo');
    }, { once: true });
    element.appendChild(image);
  }

  function applyUser(profile, fromServer = false) {
    const name = profile?.name || localStorage.getItem('userName') || 'Usuário';
    const photo = fromServer
      ? (profile?.photoUrl || profile?.photo || '')
      : (profile?.photo || localStorage.getItem('userPhoto') || '');
    const enrollment = profile?.enrollment || localStorage.getItem('enrollment') || role;
    const label = roleLabel(enrollment);

    if (name) localStorage.setItem('userName', name);
    if (photo) localStorage.setItem('userPhoto', photo);
    else if (fromServer) localStorage.removeItem('userPhoto');

    document.querySelectorAll('#userName, [data-user-name]').forEach(element => { element.textContent = name; });
    document.querySelectorAll('#headerName').forEach(element => { element.textContent = name.split(/\s+/)[0] || name; });
    document.querySelectorAll('#userRole').forEach(element => { element.textContent = label; });

    const avatarElements = new Set(document.querySelectorAll('.sidebar-avatar, .header-user-avatar, .topbar-user .avatar, [data-user-initials]'));
    avatarElements.forEach(element => renderAvatar(element, name, photo));
  }

    if (roleType) {
    // Mantém a filtragem dos elementos que já possuem classes de perfil.
    document.querySelectorAll('.sidebar-nav .admin-only').forEach(item => {
      item.style.display = roleType === 'admin' ? '' : 'none';
    });

    document.querySelectorAll('.sidebar-nav .professional-only').forEach(item => {
      item.style.display = roleType === 'professional' ? '' : 'none';
    });

    // Oculta links conforme a permissão da página de destino.
    document.querySelectorAll('.sidebar-nav a[href]').forEach(anchor => {
      const targetPage = getViewPage(anchor.href);

      if (!targetPage || !Object.prototype.hasOwnProperty.call(PAGE_ACCESS, targetPage)) {
        return;
      }

      if (PAGE_ACCESS[targetPage].includes(roleType)) {
        return;
      }

      const listItem = anchor.closest('li');

      // Evita esconder outros links quando um mesmo <li> contém mais de um.
      const elementToHide = listItem && listItem.querySelectorAll('a[href]').length === 1
        ? listItem
        : anchor;

      elementToHide.style.display = 'none';
    });
  }

  // Mostra os dados salvos enquanto busca o perfil atualizado no servidor.
  try {
    applyUser({ name: localStorage.getItem('userName'), photo: localStorage.getItem('userPhoto'), enrollment: role });
  } catch (_) {}

  if (!token) return;
  fetch(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
    .then(response => response.json().then(data => ({ response, data })))
    .then(({ response, data }) => {
      if (response.ok && data?.code === 200 && data.data) applyUser(data.data, true);
    })
    .catch(error => console.warn('Não foi possível atualizar o usuário da navegação:', error));
})();
