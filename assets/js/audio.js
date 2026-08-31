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
  const audio = document.getElementById(event.detail.element.name);
  if (!audio) return;

  audio.volume = Number(event.detail.element.value);
});