// open dialog
document.addEventListener('dialog', event => {
  document.getElementById(event.detail.value)?.showModal();
});

// load scene
document.addEventListener('scene', event => {
  const scene = document.getElementById('scene');
  if (!scene) return;

  event.detail.done = (async () => {
    const response = await fetch(`./scenes/${event.detail.value}.html`);
    if (!response.ok) return;

    scene.innerHTML = await response.text();

    scene.querySelectorAll('[data-on~="load"]').forEach(element => {
      element.dispatchEvent(new Event('load', { bubbles: true }));
    });
  })();
});

// disclaimer
document.addEventListener('disclaimer', event => {
  if (!event.detail.value) return;

  if (event.detail.value === 'accept') {
    localStorage.setItem('disclaimer', '1');
  }

  if (event.detail.value === 'decline') {
    localStorage.removeItem('disclaimer');
  }
});