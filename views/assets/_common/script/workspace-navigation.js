function resolveSiaeProjectRoot() {
  const pathname = window.location.pathname;
  const marker = '/views/';
  const index = pathname.lastIndexOf(marker);
  return index >= 0 ? pathname.slice(0, index) : '';
}

function resolveSiaeApiBase() {
  return `${window.location.origin}${resolveSiaeProjectRoot()}/api`;
}

/* Navegação única do SIAE: o menu depende do perfil, nunca da página atual. */
(() => {
  'use strict';

  const API_BASE = resolveSiaeApiBase();
  const PROJECT_ROOT = resolveSiaeProjectRoot();
  const LOGIN_URL = `${PROJECT_ROOT}/views/public/login.html`;

  const storageGet = key => {
    try { return localStorage.getItem(key) || ''; }
    catch (_) { return ''; }
  };

  const storageSet = (key, value) => {
    try {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    } catch (_) { }
  };

  const token = storageGet('token');
  const storedRole = (
    storageGet('enrollment') ||
    storageGet('siae_user_role') ||
    storageGet('siae_role')
  ).trim().toLowerCase();

  const isAdminRole = value =>
    ['admin', 'administrator', 'administrador'].includes(String(value || '').trim().toLowerCase());

  const isProfessionalRole = value =>
    ['professional', 'profissional', 'profissional de saúde', 'profissional da saúde']
      .includes(String(value || '').trim().toLowerCase());

  const roleType = isAdminRole(storedRole)
    ? 'admin'
    : isProfessionalRole(storedRole)
      ? 'professional'
      : '';

  const roleLabel = value => isAdminRole(value)
    ? 'Administrador'
    : isProfessionalRole(value)
      ? 'Profissional'
      : (value || 'Usuário');

  const initials = name => String(name || 'Usuário')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0] || '')
    .join('')
    .toUpperCase() || 'US';

  function getViewPage(url) {
    try {
      const pathname = new URL(url, window.location.href).pathname;
      const marker = '/views/';
      const index = pathname.lastIndexOf(marker);
      return index === -1 ? '' : pathname.slice(index + '/views'.length);
    } catch (_) {
      return '';
    }
  }

  const currentPage = getViewPage(window.location.href);
  const homePage = roleType === 'admin' ? '/admin/admin.html' : '/app/dashboard.html';
  const homeUrl = `${PROJECT_ROOT}/views${homePage}`;

  /*
   * A localização física do arquivo não define o perfil autorizado.
   * Serviços está em /admin/, mas é uma página exclusiva do profissional.
   */
  const PAGE_ACCESS = {
    '/admin/admin.html': ['admin'],
    '/admin/notifications.html': ['admin'],
    '/admin/professionals.html': ['admin'],
    '/admin/reports.html': ['admin'],
    '/admin/sectors.html': ['admin'],
    '/admin/services.html': ['professional'],
    '/admin/students.html': ['admin'],

    '/app/appointments.html': ['professional'],
    '/app/dashboard.html': ['professional'],
    '/app/occurrences.html': ['professional'],
    '/app/student-documents.html': ['professional'],
    '/app/student-history.html': ['professional'],

    '/app/charts.html': ['admin', 'professional'],
    '/app/faq.html': ['admin', 'professional'],
    '/app/notifications.html': ['admin', 'professional'],
    '/app/profile.html': ['admin', 'professional'],
    '/app/reports.html': ['admin', 'professional'],
    '/app/search.html': ['admin', 'professional'],
    '/app/student-details.html': ['admin', 'professional']
  };

  // Os menus são fixos por perfil e reaproveitados em TODAS as páginas.
  const MENUS = {
    admin: [
      {
        title: 'Principal',
        items: [
          { label: 'Dashboard', page: '/admin/admin.html' },
          { label: 'Busca de alunos', page: '/app/search.html' }

        ]
      },
      {
        title: 'Gestão',
        items: [
          { label: 'Alunos', page: '/admin/students.html' },
          { label: 'Profissionais', page: '/admin/professionals.html' },
          { label: 'Setores', page: '/admin/sectors.html' },
          { label: 'Relatórios', page: '/admin/reports.html' }
        ]
      },
      {
        title: 'Acompanhamento',
        items: [
          { label: 'Gráficos', page: '/app/charts.html' },
          { label: 'FAQ', page: '/app/faq.html' },
          { label: 'Notificações', page: '/app/notifications.html' }
        ]
      },
      {
        title: 'Conta',
        items: [
          { label: 'Meu perfil', page: '/app/profile.html' },
          { label: 'Sair', page: '/public/login.html', logout: true }
        ]
      }
    ],
    professional: [
      {
        title: 'Principal',
        items: [
          { label: 'Dashboard', page: '/app/dashboard.html' },
          { label: 'Busca de alunos', page: '/app/search.html' }
        ]
      },
      {
        title: 'Atendimento',
        items: [
          { label: 'Atendimentos', page: '/app/appointments.html' },
          { label: 'Ocorrências', page: '/app/occurrences.html' },
          { label: 'Serviços', page: '/admin/services.html' }
        ]
      },
      {
        title: 'Acompanhamento',
        items: [
          { label: 'Gráficos', page: '/app/charts.html' },
          { label: 'Relatórios', page: '/app/reports.html' },
          { label: 'FAQ', page: '/app/faq.html' },
          { label: 'Notificações', page: '/app/notifications.html' }
        ]
      },
      {
        title: 'Conta',
        items: [
          { label: 'Meu perfil', page: '/app/profile.html' },
          { label: 'Sair', page: '/public/login.html', logout: true }
        ]
      }
    ]
  };

  // Bloqueia acesso direto a páginas sem permissão, mesmo fora do menu.
  if (Object.prototype.hasOwnProperty.call(PAGE_ACCESS, currentPage)) {
    if (!token || !roleType) {
      window.location.replace(LOGIN_URL);
      return;
    }

    if (!PAGE_ACCESS[currentPage].includes(roleType)) {
      window.location.replace(homeUrl);
      return;
    }
  }

  if (roleType) {
    document.body.dataset.role = roleType;
    document.body.dataset.menuProfile = roleType;
    const backToStudents = document.querySelector("#backToStudents");
    if (backToStudents) {
      if (roleType === "admin") {
        backToStudents.href = `${PROJECT_ROOT}/views/admin/students.html`;
      } else {
        backToStudents.href = `${PROJECT_ROOT}/views/app/search.html`;

      }
    }


    function applyRoleVisibility() {
      document.querySelectorAll('.admin-only').forEach(element => {
        if (roleType === 'admin') element.style.removeProperty('display');
        else element.style.setProperty('display', 'none', 'important');
      });

      document.querySelectorAll('.professional-only').forEach(element => {
        if (roleType === 'professional') element.style.removeProperty('display');
        else element.style.setProperty('display', 'none', 'important');
      });
    }

    function createNavigationLink(item) {
      const li = document.createElement('li');
      li.style.width = '100%';
      li.style.listStyle = 'none';
      const anchor = document.createElement('a');
      const href = item.page === '/public/login.html'
        ? `${PROJECT_ROOT}/views/public/login.html`
        : `${PROJECT_ROOT}/views${item.page}`;

      anchor.href = href;
      anchor.className = 'nav-with-icon';
      anchor.textContent = item.label;

      if (item.logout) anchor.setAttribute('data-logout', '');

      // Algumas páginas pertencem a uma seção principal do menu.
      // Por isso, devem destacar o mesmo item da sua listagem.

      const paginasVinculadas = {
        "/admin/professional-details.html": "/admin/professionals.html",
        "/admin/professionals-inactive.html": "/admin/professionals.html",

        "/admin/students-inactive.html": "/admin/students.html",
        "/admin/sector-details.html": "/admin/sectors.html",
        "/admin/sectors-inactive.html": "/admin/sectors.html",

        "/app/student-details.html":
          roleType === "admin"
            ? "/admin/students.html"
            : "/app/search.html",

        "/app/student-history.html":
          roleType === "admin"
            ? "/admin/students.html"
            : "/app/search.html",

        "/app/student-documents.html":
          roleType === "admin"
            ? "/admin/students.html"
            : "/app/search.html",

      };

      // Identifica qual item do menu deve ficar selecionado.
      const paginaSelecionada =
        paginasVinculadas[currentPage] ?? currentPage;

      // Compara com a página principal ou vinculada.
      if (item.page === paginaSelecionada) {

        anchor.classList.add('is-active', 'active');
        anchor.setAttribute('aria-current', 'page');
      }

      li.appendChild(anchor);
      return li;
    }

    function renderUnifiedSidebar() {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar) return;

      const nav = sidebar.querySelector('nav');
      if (!nav) {
        console.warn('SIAE: não foi encontrado um <nav> dentro da barra lateral.');
        return;
      }

      nav.setAttribute('aria-label', roleType === 'admin'
        ? 'Navegação administrativa'
        : 'Navegação profissional');
      nav.classList.add('siae-unified-sidebar-nav');
      nav.replaceChildren();

      MENUS[roleType].forEach(group => {
        const heading = document.createElement('p');
        heading.className = 'sidebar-section-label';
        heading.textContent = group.title;
        nav.appendChild(heading);

        const list = document.createElement('ul');
        list.className = 'sidebar-nav';
        list.setAttribute('role', 'list');
        list.style.listStyle = 'none';
        list.style.margin = '0';
        list.style.padding = '0';
        list.style.width = '100%';

        group.items.forEach(item => list.appendChild(createNavigationLink(item)));
        nav.appendChild(list);
      });
    }

    function makeBrandReturnHome() {
      const sidebar = document.querySelector('.sidebar');
      const brand = sidebar?.querySelector('.sidebar-brand, .sidebar-logo');
      if (!brand) return;

      let link = brand;
      if (brand.tagName !== 'A') {
        link = document.createElement('a');
        Array.from(brand.attributes).forEach(attribute => {
          link.setAttribute(attribute.name, attribute.value);
        });
        while (brand.firstChild) link.appendChild(brand.firstChild);
        brand.replaceWith(link);
      }

      link.href = homeUrl;
      link.setAttribute('aria-label', roleType === 'admin'
        ? 'Voltar ao dashboard administrativo'
        : 'Voltar ao dashboard profissional');
      link.setAttribute('title', 'Voltar ao dashboard');
    }

    // As mesmas opções aparecem em todas as telas daquele perfil.
    renderUnifiedSidebar();
    makeBrandReturnHome();
    applyRoleVisibility();

    // Esconde links de outras áreas que possam existir no conteúdo das páginas.
    document.querySelectorAll('a[href]').forEach(anchor => {
      const targetPage = getViewPage(anchor.href);
      if (!targetPage || !Object.prototype.hasOwnProperty.call(PAGE_ACCESS, targetPage)) return;

      const allowed = PAGE_ACCESS[targetPage].includes(roleType);
      if (allowed) anchor.style.removeProperty('display');
      else anchor.style.setProperty('display', 'none', 'important');

      const listItem = anchor.closest('li');
      if (listItem && listItem.querySelectorAll('a[href]').length === 1) {
        if (allowed) listItem.style.removeProperty('display');
        else listItem.style.setProperty('display', 'none', 'important');
      }
    });
  }

  function resolvePhotoUrl(photo) {
    if (!photo || typeof photo !== 'string') return '';
    const normalized = photo.trim().replace(/\\/g, '/');
    let path = normalized;

    if (/^https?:\/\//i.test(normalized)) {
      try { path = new URL(normalized).pathname; }
      catch (_) { return ''; }
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
    const name = profile?.name || storageGet('userName') || 'Usuário';
    const photo = fromServer
      ? (profile?.photoUrl || profile?.photo || '')
      : (profile?.photo || storageGet('userPhoto') || '');
    const enrollment = profile?.enrollment || storageGet('enrollment') || storedRole;
    const label = roleLabel(enrollment);

    if (name) storageSet('userName', name);
    if (photo) storageSet('userPhoto', photo);
    else if (fromServer) storageSet('userPhoto', '');

    document.querySelectorAll('#userName, [data-user-name]').forEach(element => {
      element.textContent = name;
    });
    document.querySelectorAll('#headerName').forEach(element => {
      element.textContent = name.split(/\s+/)[0] || name;
    });
    document.querySelectorAll('#userRole, [data-user-role]').forEach(element => {
      element.textContent = label;
    });

    const avatarElements = new Set(document.querySelectorAll(
      '.sidebar-avatar, .header-user-avatar, .topbar-user .avatar, [data-user-initials]'
    ));
    avatarElements.forEach(element => renderAvatar(element, name, photo));
  }

  // Renderiza os dados locais imediatamente e depois sincroniza com a API.
  try {
    applyUser({
      name: storageGet('userName'),
      photo: storageGet('userPhoto'),
      enrollment: storedRole
    });
  } catch (error) {
    console.warn('SIAE: não foi possível aplicar os dados locais do usuário.', error);
  }

  if (!token) return;

  fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(response => response.json().then(data => ({ response, data })))
    .then(({ response, data }) => {
      if (response.ok && data?.code === 200 && data.data) applyUser(data.data, true);
    })
    .catch(error => console.warn(
      'Não foi possível atualizar o usuário da navegação:', error
    ));
})();
