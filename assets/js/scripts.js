import * as settings from './settings.js';
import './events.js';
import './navigation.js';
import './audio.js';
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