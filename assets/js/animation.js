// Resolves when CSS animation 'name' on 'element' ends.
const wait = (element, name) => element
  ? new Promise(resolve =>
      element.addEventListener(
        'animationend',
        ({ animationName }) => {
          if (animationName === name) resolve();
        }
      )
    )
  : Promise.resolve();

// monitor
document.addEventListener('monitor', event => {
  const monitor = document.getElementById('monitor');
  if (!monitor) return;
  if (!event.detail.value) return monitor.classList.value = '';

  monitor.classList.toggle(
    event.detail.value,
    event.detail.element.value === 'on'
  );

  persist(event);
});

// screen
document.addEventListener('screen', event => {
  const screen = document.getElementById('screen');
  if (!screen) return;

  Object.entries(event.detail)
    .filter(([key]) => !INTERNAL.includes(key))
    .forEach(([key, value]) => screen.style.setProperty(`--${key}`, value));
    
  if (!event.detail.value) return screen.classList.value = '';

  screen.classList.value = event.detail.value;
  screen.inert = true;

  event.detail.done = wait(
    screen, event.detail.value
  ).finally(() => {
    screen.inert = false;

    Object.keys(event.detail)
      .filter(key => !INTERNAL.includes(key))
      .forEach(key => screen.style.removeProperty(`--${key}`));
  });
});
