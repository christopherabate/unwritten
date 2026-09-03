import * as settings from './settings.js';
import * as audio from './audio.js';
import './events.js';
import './navigation.js';
import './animation.js';
import './controls.js';
import './i18n.js';

// init settings
settings.init();

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

// music autoplays
document.addEventListener('pointerdown', async () => {
  try {
    await audio.play('music', 'title', true);
  } catch (_) {}
}, { once: true });