const DEFAULT_SETTINGS = {
  monitor: {
    glitch: 'on',
    shader: 'on'
  },
  volume: {
    music: .5,
    effects: .5
  },
  i18n: {
    lang: 'en'
  }
};

export const data = JSON.parse(
  localStorage.getItem('settings') ?? '{}'
);

export const save = () => {
  localStorage.setItem(
    'settings',
    JSON.stringify(data)
  );
};

export const update = event => {
  if (event.detail.source === 'settings') return;

  data[event.type] ??= {};
  data[event.type][event.detail.value] =
    event.detail.element.value;

  save();
};

export const init = () => {
  Object.entries(DEFAULT_SETTINGS).forEach(([group, values]) => {
    data[group] ??= {};

    Object.entries(values).forEach(([key, value]) => {
      data[group][key] ??= value;
    });
  });

  save();

  Object.entries(data).forEach(([group, values]) => {
    Object.entries(values).forEach(([key, value]) => {
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
  });
};