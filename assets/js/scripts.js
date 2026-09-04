import * as settings from './settings.js';
import './audio.js';
import './events.js';
import './navigation.js';
import './animation.js';
import './controls.js';
import './i18n.js';

// init settings
settings.init();

// activate submit buttons
document.addEventListener('change', ({ target }) => {
  if (!target.form) return;
  const submit = target.form.querySelector('button[type="submit"]');
  if (!submit) return;
  submit.disabled = !target.form.checkValidity();
});

// default scene
document.dispatchEvent(
  new CustomEvent('scene', {
    detail: {
      value: localStorage.getItem('disclaimer')
        ? 'title'
        : 'disclaimer'
    }
  })
);
