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

export const update = event => {
  document.dispatchEvent(
    new CustomEvent('settings', {
      detail: {
        group: event.type,
        key: event.detail.value,
        value: event.detail.element.value
      }
    })
  );

 if (event.detail.source === 'init') {
    document.dispatchEvent(
      new CustomEvent(event.type, {
        detail: {
          value: event.detail.value,
          element: event.detail.element
        }
      })
    );

    return;
  }

  data[event.type] ??= {};
  data[event.type][event.detail.value] = event.detail.element.value;

  localStorage.setItem('settings', JSON.stringify(data));
};

export const init = () => {
  Object.entries(DEFAULT_SETTINGS).forEach(([group, values]) => {
    data[group] ??= {};

    Object.entries(values).forEach(([key, value]) => {
      data[group][key] ??= value;
    });
  });

  Object.entries(data).forEach(([group, values]) => {
    Object.entries(values).forEach(([key, value]) => {
      update({
        type: group,
        detail: {
          value: key,
          element: { value },
          source: 'init'
        }
      });
    });
  });
};