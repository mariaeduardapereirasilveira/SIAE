/* SIAE — alternância visual global. Não interfere nos scripts de negócio. */
(() => {
  'use strict';
  const root = document.documentElement;
  const storageKey = 'siae_theme';

  function readTheme() {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored === 'dark' || stored === 'light' ? stored : 'light';
    } catch (_) {
      return 'light';
    }
  }

  function saveTheme(theme) {
    try { localStorage.setItem(storageKey, theme); } catch (_) { /* storage may be blocked */ }
  }

  function paint(theme) {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const label = dark ? 'Ativar modo claro' : 'Ativar modo escuro';
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      button.setAttribute('aria-pressed', dark ? 'true' : 'false');
      const text = button.querySelector('.theme-toggle-label');
      if (text) text.textContent = dark ? 'Escuro' : 'Claro';
    });
  }

  paint(readTheme());
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      saveTheme(next);
      paint(next);
    });
  });
})();
