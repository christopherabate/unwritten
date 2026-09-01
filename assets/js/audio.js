import { persist } from './settings.js';

// music autoplay
['pointerdown', 'keydown'].forEach(type => {
  document.addEventListener(type, async () => {
    try {
      await document.getElementById('music').play();
    } catch (_) {}
  }, { once: true })
});

// music volume
document.addEventListener('volume', event => {
  if (!event.detail.value) return

  const audio = document.getElementById(event.detail.value);
  if (!audio) return;

  audio.volume = Number(event.detail.element.value);

  persist(event);
});