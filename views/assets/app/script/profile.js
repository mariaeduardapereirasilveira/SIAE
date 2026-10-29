(() => {
  'use strict';

  const API_BASE = 'http://localhost/SIAE/api';
  const token = localStorage.getItem('token');
  const photoInput = document.getElementById('profilePhotoInput');
  const chooseButton = document.getElementById('chooseProfilePhoto');
  const cancelButton = document.getElementById('cancelProfilePhoto');
  const saveButton = document.getElementById('saveProfilePhoto');
  const photoElement = document.getElementById('profilePhoto');
  const initialsElement = document.getElementById('profilePhotoInitials');
  const feedback = document.getElementById('profilePhotoFeedback');
  let currentProfile = null;
  let pendingFile = null;
  let previewObjectUrl = null;

  if (!token) {
    window.location.href = '../public/login.html';
    return;
  }

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

  function setPhoto(photo, name, isPreview = false) {
    const url = isPreview ? photo : resolvePhotoUrl(photo);
    initialsElement.textContent = initials(name);
    if (!url) {
      photoElement.removeAttribute('src');
      photoElement.hidden = true;
      initialsElement.hidden = false;
      return;
    }
    photoElement.src = url;
    photoElement.alt = `Foto de ${name || 'usuário'}`;
    photoElement.hidden = false;
    initialsElement.hidden = true;
    photoElement.onerror = () => {
      photoElement.hidden = true;
      initialsElement.hidden = false;
    };
  }

  function setFeedback(message, type = '') {
    feedback.textContent = message;
    feedback.classList.remove('is-success', 'is-error');
    if (type) feedback.classList.add(`is-${type}`);
  }

  function showDate(value) {
    if (!value) return '—';
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : String(value);
  }

  function roleName(enrollment) {
    const roles = {
      administrador: 'Administrador',
      profissional: 'Profissional',
      estudante: 'Estudante'
    };
    return roles[String(enrollment || '').toLowerCase()] || enrollment || '—';
  }

  function fillProfile(profile) {
    currentProfile = profile;
    const name = profile.name || localStorage.getItem('userName') || 'Usuário';
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileRole').textContent = `${roleName(profile.enrollment)}${profile.sectorName ? ` · ${profile.sectorName}` : profile.className ? ` · ${profile.className}` : ''}`;
    document.getElementById('fieldName').textContent = name;
    document.getElementById('fieldEmail').textContent = profile.email || '—';
    document.getElementById('fieldEnrollment').textContent = roleName(profile.enrollment);
    document.getElementById('fieldDateBirth').textContent = showDate(profile.dateBirth);
    document.getElementById('fieldSector').textContent = profile.sectorName || '—';
    document.getElementById('fieldClass').textContent = profile.className || '—';
    const status = document.getElementById('fieldStatus');
    const active = Number(profile.active) === 1;
    status.textContent = active ? 'Ativo' : 'Inativo';
    status.classList.toggle('is-inactive', !active);
    document.getElementById('profileSectorRow').hidden = profile.enrollment === 'estudante';
    document.getElementById('profileClassRow').hidden = profile.enrollment !== 'estudante';
    const persistedPhoto = profile.photoUrl || profile.photo || '';
    setPhoto(persistedPhoto, name);
    localStorage.setItem('userName', name);
    localStorage.setItem('enrollment', profile.enrollment || localStorage.getItem('enrollment') || '');
    if (persistedPhoto) localStorage.setItem('userPhoto', persistedPhoto);
    else localStorage.removeItem('userPhoto');
  }

  async function loadProfile() {
    try {
      const response = await fetch(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok || result?.code !== 200 || !result.data) throw new Error(result?.message || 'Não foi possível carregar o perfil.');
      fillProfile(result.data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setFeedback(error.message || 'Erro ao carregar o perfil.', 'error');
      if (error.message && /sessão inválida|expirada|autenticado/i.test(error.message)) {
        localStorage.removeItem('token');
        window.location.href = '../public/login.html';
      }
    }
  }

  function resetPendingPhoto(restore = true) {
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
    pendingFile = null;
    if (photoInput) photoInput.value = '';
    chooseButton.hidden = false;
    chooseButton.textContent = 'Alterar foto';
    cancelButton.hidden = true;
    saveButton.hidden = true;
    if (restore && currentProfile) setPhoto(currentProfile.photoUrl || currentProfile.photo || '', currentProfile.name || 'Usuário');
  }

  chooseButton.addEventListener('click', () => photoInput.click());
  cancelButton.addEventListener('click', () => {
    resetPendingPhoto(true);
    setFeedback('Alteração cancelada.');
  });

  photoInput.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    if (!file) return;
    // Permite selecionar novamente o mesmo arquivo para substituir a prévia.
    photoInput.value = '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFeedback('Escolha uma imagem JPG, PNG ou WEBP.', 'error');
      resetPendingPhoto(true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedback('A foto deve ter no máximo 5 MB.', 'error');
      resetPendingPhoto(true);
      return;
    }

    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    pendingFile = file;
    previewObjectUrl = URL.createObjectURL(file);
    setPhoto(previewObjectUrl, currentProfile?.name || 'Usuário', true);
    chooseButton.textContent = 'Trocar foto';
    chooseButton.hidden = false;
    cancelButton.hidden = false;
    saveButton.hidden = false;
    setFeedback('Prévia atualizada. Salve para aplicar a nova foto.');
  });

  function updateNavigationAvatars(profile) {
    const name = profile.name || 'Usuário';
    const photo = profile.photoUrl || profile.photo || '';
    const makeInitials = () => initials(name);
    document.querySelectorAll('#userName, [data-user-name]').forEach(element => element.textContent = name);
    document.querySelectorAll('#headerName').forEach(element => element.textContent = name.split(/\s+/)[0] || name);
    document.querySelectorAll('#userRole').forEach(element => element.textContent = roleName(profile.enrollment));
    document.querySelectorAll('.sidebar-avatar, .header-user-avatar, .topbar-user .avatar, [data-user-initials]').forEach(element => {
      element.textContent = makeInitials();
      const url = resolvePhotoUrl(photo);
      if (!url) return;
      const image = document.createElement('img'); image.className = 'user-avatar-image'; image.alt = ''; image.src = url;
      image.addEventListener('error', () => image.remove(), { once: true }); element.appendChild(image);
    });
  }

  saveButton.addEventListener('click', async () => {
    if (!pendingFile) return;
    saveButton.disabled = true;
    saveButton.textContent = 'Salvando...';
    setFeedback('Enviando a foto…');
    try {
      const payload = new FormData();
      payload.append('photo', pendingFile);
      const response = await fetch(`${API_BASE}/users/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: payload
      });
      const result = await response.json();
      if (!response.ok || result?.code !== 200 || !result.data?.photo) throw new Error(result?.message || 'Não foi possível salvar a foto.');

      currentProfile.photo = result.data.photo || '';
      currentProfile.photoUrl = result.data.photoUrl || result.data.photo || '';
      localStorage.setItem('userPhoto', currentProfile.photoUrl);
      setPhoto(currentProfile.photoUrl, currentProfile.name || 'Usuário');
      updateNavigationAvatars(currentProfile);
      resetPendingPhoto(false);
      setFeedback('Foto atualizada com sucesso.', 'success');
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      setFeedback(error.message || 'Erro ao atualizar foto.', 'error');
      // Mantém a prévia e permite tentar novamente.
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = 'Salvar foto';
    }
  });

  loadProfile();
})();
