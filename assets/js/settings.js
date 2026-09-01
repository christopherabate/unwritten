const DEFAULT_SETTINGS = {
  monitor: {
    glitch: 'on',
    shader: 'on'
  },
  volume: {
    music: 1,
    effects: 1
  },
  i18n: {
    lang: 'fr'
  }
};

// default init
export const settings = JSON.parse(
  localStorage.getItem('settings')
  ?? JSON.stringify(DEFAULT_SETTINGS)
);

localStorage.setItem('settings', JSON.stringify(settings));

// settings listener
document.addEventListener('settings', ({ detail }) => {
  const { group, key, value } = detail;
  settings[group] ??= {};
  settings[group][key] = value;

  localStorage.setItem('settings', JSON.stringify(settings));
});

// settings dispatcher
export const persist = event => {
  if (event.detail.source === 'settings') return;

  console.log('group: ',event.type,
        'key: ',event.detail.value,
        'value: ',event.detail.element.value);

  document.dispatchEvent(
    new CustomEvent('settings', {
      detail: {
        group: event.type,
        key: event.detail.value,
        value: event.detail.element.value
      }
    })
  );
};

// apply settings
export const applySettings = settings => {
  Object.entries(settings).forEach(([group, values]) => {
    Object.entries(values).forEach(([key, value]) => {

      console.log('apply settings:', group, key, value);

      document.dispatchEvent(
        new CustomEvent(group, {
          detail: {
            value: key,
            element: { value },
            source: 'settings'
          }
        })
      );
    });
  })
};
