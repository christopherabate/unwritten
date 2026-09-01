import * as settings from './settings.js';

let translations = {};

// replace i18n data attributes
export const translate = (element, variables = {}) => {
  element.querySelectorAll('[data-i18n]').forEach(element => {
    const [attribute, key] = element.dataset.i18n.split(':');
    let translation = translations[key || attribute];

    if (!translation) return;

    Object.entries(variables).forEach(([key, value]) => {
      translation = translation.replaceAll(`{${key}}`, value);
    });

    if (key) {
      element.setAttribute(attribute, translation);
      return;
    }

    const target = element.querySelector('[data-i18n-content]');

    if (!target) return;

    target.innerHTML = translation;
  });
};

// lang select
document.addEventListener('locale', async event => {
  if (event.detail.value !== 'lang') return;

  const response = await fetch(`./assets/i18n/${event.detail.element.value}.json`);
  if (!response.ok) return;

  translations = await response.json();
  
  document.documentElement.lang = event.detail.element.value;

  settings.update(event);

  translate(document);
});

// scene change
document.addEventListener('scene', async event => {
  if (event.detail.done) await event.detail.done;

  translate(document.getElementById(event.detail.value));
});