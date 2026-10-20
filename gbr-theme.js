/* GBR Racing Lab · Aparência local — nenhum acesso a dados privados ou à API. */
(function () {
  'use strict';

  const STORAGE_KEY = 'gbr-visual-theme-v1';
  const VALID_THEMES = new Set(['dark', 'light']);
  const html = document.documentElement;
  let theme = 'dark';

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (VALID_THEMES.has(saved)) theme = saved;
  } catch (_error) {
    // Armazenamento desabilitado: continua utilizável na aba atual.
  }

  function applyTheme(value, persist) {
    if (!VALID_THEMES.has(value)) return;
    theme = value;
    html.setAttribute('data-theme', value);
    html.style.colorScheme = value;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', value === 'light' ? '#F3F7FA' : '#0B0B0F');
    document.querySelectorAll('input[name="gbr-theme"]').forEach(function (input) {
      input.checked = input.value === value;
    });
    document.querySelectorAll('[data-gbr-theme-select]').forEach(function (select) {
      select.value = value;
    });
    document.querySelectorAll('[data-gbr-theme-state]').forEach(function (element) {
      element.textContent = value === 'light' ? 'Claro' : 'Escuro';
    });
    if (persist) {
      try { window.localStorage.setItem(STORAGE_KEY, value); } catch (_error) { /* Degradação local. */ }
    }
  }

  // Executado no <head>, antes de renderizar o login, para evitar flash de tema.
  applyTheme(theme, false);

  function initSettings() {
    const dialog = document.getElementById('gbrSettingsDialog');
    let trigger = null;

    document.querySelectorAll('[data-gbr-settings-open]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (!dialog || typeof dialog.showModal !== 'function') return;
        const mobilePanel = document.getElementById('mobileMorePanel');
        if (mobilePanel && !mobilePanel.hidden) {
          mobilePanel.hidden = true;
          const backdrop = document.getElementById('mobileMoreBackdrop');
          if (backdrop) backdrop.hidden = true;
          const moreButton = document.getElementById('mobileMoreBtn');
          if (moreButton) moreButton.setAttribute('aria-expanded', 'false');
        }
        trigger = button;
        applyTheme(theme, false);
        if (!dialog.open) dialog.showModal();
      });
    });

    if (dialog) {
      dialog.addEventListener('change', function (event) {
        const target = event.target;
        if (target && target.name === 'gbr-theme') applyTheme(target.value, true);
      });
      dialog.addEventListener('close', function () {
        if (trigger && trigger.isConnected) trigger.focus();
      });
      dialog.addEventListener('click', function (event) {
        if (event.target === dialog) dialog.close();
      });
    }

    document.querySelectorAll('[data-gbr-theme-select]').forEach(function (select) {
      select.addEventListener('change', function () { applyTheme(select.value, true); });
    });
    applyTheme(theme, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettings, { once: true });
  } else {
    initSettings();
  }

  // Preferência compartilhada entre abas na mesma origem; nunca contém dados privados.
  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY) {
      applyTheme(VALID_THEMES.has(event.newValue) ? event.newValue : 'dark', false);
    }
  });
})();