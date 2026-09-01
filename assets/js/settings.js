const DEFAULT_SETTINGS = {
  locale: {
    lang: 'en'
  },
  monitor: {
    glitch: 'on',
    shader: 'on'
  },
  volume: {
    music: .5,
    effects: .5
  }
};

export const data = JSON.parse(
  localStorage.getItem('settings') || '{}'
);

export const update = event => {
  if (!(event.detail.value in (DEFAULT_SETTINGS[event.type] ?? {}))) return;
  
  if (event.detail.source === 'init') {
    document.dispatchEvent(
      new CustomEvent(event.type, {
        detail: {
          value: event.detail.value,
          element: event.detail.element
        }
      })
    );
  } else {
    data[event.type][event.detail.value] = event.detail.element.value;
    localStorage.setItem('settings', JSON.stringify(data));
  }

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