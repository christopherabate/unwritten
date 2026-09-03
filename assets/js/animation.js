import { INTERNAL } from './events.js';
import * as settings from './settings.js';

// Resolves when CSS animation 'name' on 'element' ends.
const wait = name =>
  document.getAnimations().some(animation => animation.animationName === name)
    ? new Promise(resolve =>
        document.addEventListener(
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

  event.detail.element.value = event.detail.element.type === 'checkbox'
    ? event.detail.element.checked ? 'on' : 'off'
    : event.detail.element.value;

  monitor.classList.toggle(event.detail.value, event.detail.element.value === 'on');

  settings.update(event);
});

// screen
document.addEventListener('screen', event => {
  const screen = document.getElementById('screen');
  if (!screen) return;

  console.log(event.detail);

  Object.entries(event.detail)
    .filter(([key]) => !INTERNAL.includes(key))
    .forEach(([key, value]) => screen.style.setProperty(`--${key}`, value));
    
  screen.classList.value = '';
  void screen.offsetWidth;
  
  screen.classList.value = event.detail.value;
  screen.inert = true;

  event.detail.done = wait(event.detail.value)
    .finally(() => {
      screen.inert = false;

      Object.keys(event.detail)
        .filter(key => !INTERNAL.includes(key))
        .forEach(key => screen.style.removeProperty(`--${key}`));
    });
});
