const screen = document.querySelector("#screen");
const shutter = document.querySelector("#screen > :first-child");

// Resolves when the requested CSS animation completes on `element`.
const waitAnimation = (element, name) =>
  element
    ? new Promise((resolve) =>
        element.addEventListener(
          "animationend",
          ({ animationName }) => animationName === name && resolve(),
          { once: true }
        )
      )
    : Promise.resolve();

// Syncs all controls matching a persisted setting.
const syncSetting = (name) =>
  document.querySelectorAll(`input[name="${name}"]`).forEach((element) => {
    if (element.type === "range") {
      element.value = localStorage[name];
    } else if (element.type === "radio") {
      element.checked = element.value === localStorage[name];
    } else if (element.type === "checkbox") {
      element.checked = localStorage[name] === "1";
    }
  });

// Action handlers referenced by `data-action`.
const actions = {
  volume: ({ element, value, setting }) => {
    const target = document.getElementById(value);
    if (!target) return;

    const volume = setting ?? element.value;

    localStorage[value] = volume;
    target.volume = Number(volume);
  },

  shutter: async ({ value }) => {
    shutter?.classList.remove("turn-off", "turn-on");
    shutter?.classList.add(value);

    await (shutter && waitAnimation(shutter, value));

    shutter?.classList.remove(value);
  },

  standby: async () => {
    shutter?.classList.remove("turn-off", "turn-on");
    shutter?.classList.add("standby");

    await (shutter && waitAnimation(shutter, "standby"));

    shutter?.classList.remove("standby");
  },

  dialog: ({ value }) =>
    document.getElementById(value)?.showModal(),

  shader: ({ element, setting }) => {
    const state =
      setting ??
      (element.type === "radio"
        ? element.value
        : element.checked
          ? "1"
          : "0");

    localStorage[shader] = state;
    syncSetting("shader");

    shutter?.classList.toggle(
      "shader",
      localStorage[shader] === "1"
    );
  },

  glitch: ({ element, setting }) => {
    const state =
      setting ??
      (element.type === "radio"
        ? element.value
        : element.checked
          ? "1"
          : "0");

    localStorage[glitch] = state;
    syncSetting("glitch");

    screen?.classList.toggle(
      "glitch",
      localStorage[glitch] === "1"
    );
  },

  fullscreen: async () => {
    try {
      document.fullscreenElement
        ? await document.exitFullscreen()
        : await document.documentElement.requestFullscreen();
    } catch (_) {}
  },

  shelf: async () => {
    shutter?.classList.add("shelf");

    await (shutter && waitAnimation(shutter, "shelf"));

    shutter?.classList.remove("shelf");
  },
};

// Delegates events to elements using `data-action`.
["click", "change", "input"].forEach((type) =>
  document.addEventListener(type, async ({ target }) => {
    const element = target.closest("[data-action]");
    if (!element) return;

    if (
      (type === "click" &&
        element.matches("input, select, textarea")) ||
      (type === "change" && !element.matches("input")) ||
      (type === "input" &&
        !element.matches('input[type="range"]'))
    ) {
      return;
    }

    for (const chunk of element.dataset.action.split("|")) {
      const [name, value] = chunk.trim().split(":");

      await actions[name]?.({
        element,
        value
      });
    }
  })
);

// Default values for persisted settings.
const settings = {
  shader: "1",
  glitch: "1",
  music: ".5",
  effects: ".5"
};

// Restores persisted settings and applies their actions.
Object.entries(settings).forEach(([name, defaultValue]) => {
  localStorage[name] ??= defaultValue;

  const element = document.querySelector(`input[name="${name}"]`);
  if (!element) return;

  syncSetting(name);

  for (const chunk of element.dataset.action?.split("|") ?? []) {
    const [action, value] = chunk.trim().split(":");

    actions[action]?.({
      element,
      value,
      setting: localStorage[name]
    });
  }
});