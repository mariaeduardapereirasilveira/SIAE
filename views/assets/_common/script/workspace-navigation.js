/* Mantém a navegação por perfil e sincroniza nome/foto do usuário autenticado. */
(() => {
  'use strict';

  const API_BASE = 'http://localhost/SIAE/api';
  const token = (() => { try { return localStorage.getItem('token') || ''; } catch (_) { return ''; } })();
  let role = '';
  try {
    role = (localStorage.getItem('enrollment') || localStorage.getItem('siae_user_role') || localStorage.getItem('siae_role') || '').trim().toLowerCase();
  } catch (_) {}

  const isAdminRole = value => ['admin', 'administrator', 'administrador'].includes(String(value || '').trim().toLowerCase());
  const isProfessionalRole = value => ['professional', 'profissional', 'profissional de saúde', 'profissional da saúde'].includes(String(value || '').trim().toLowerCase());
  const roleLabel = value => isAdminRole(value) ? 'Administrador' : isProfessionalRole(value) ? 'Profissional' : (value || 'Usuário');
  const initials = name => String(name || 'Usuário').trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || 'US';

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

  if (role) {
    document.querySelectorAll('.sidebar-nav .admin-only').forEach(item => { item.style.display = isAdminRole(role) ? '' : 'none'; });
    document.querySelectorAll('.sidebar-nav .professional-only').forEach(item => { item.style.display = isProfessionalRole(role) ? '' : 'none'; });
    document.querySelectorAll('.sidebar-nav .admin-only.sidebar-section-label').forEach(item => { item.style.display = isAdminRole(role) ? '' : 'none'; });
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
