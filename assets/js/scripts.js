const screen = document.querySelector("#screen");
const shutter = document.querySelector("#screen > :first-child");

// Resolves when the requested CSS animation completes on `element`.
// If `element` is missing, resolves immediately to keep callers simple.
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

// Mirrors the persisted setting (`localStorage[name]`) to all matching inputs.
// Supports both:
// - radios (explicit `value`)
// - single checkbox-style input (uses "1"/"0")
const syncSetting = (name) =>
  document.querySelectorAll(`input[name="${name}"]`).forEach((element) =>
    element.checked = element.hasAttribute("value")
      ? element.value === localStorage[name]
      : localStorage[name] === "1"
  );

// Action handlers referenced by `data-action` tokens.
const actions = {
  // Plays a shutter transition class ("turn-on" / "turn-off") and waits for completion.
  shutter: async ({ value }) => {
    shutter?.classList.remove("turn-off", "turn-on");
    shutter?.classList.add(value);
    await (shutter && waitAnimation(shutter, value));
    shutter?.classList.remove(value);
  },

  // Plays standby animation and removes the class once done.
  standby: async () => {
    shutter?.classList.remove("turn-off", "turn-on");
    shutter?.classList.add("standby");
    await (shutter && waitAnimation(shutter, "standby"));
    shutter?.classList.remove("standby");
  },

  // Opens <dialog id="...">, where `value` is the dialog id.
  dialog: ({ value }) => document.getElementById(value)?.showModal(),

  // Persists shader state, syncs controls, then applies the visual class.
  shader: ({ element, value }) => {
    localStorage.shader = value ?? (element.hasAttribute("value") ? element.value : (element.checked ? "1" : "0"));
    syncSetting("shader");
    shutter?.classList.toggle("shader", localStorage.shader === "1");
  },

  // Persists glitch state, syncs controls, then applies the visual class.
  glitch: ({ element, value }) => {
    localStorage.glitch = value ?? (element.hasAttribute("value") ? element.value : (element.checked ? "1" : "0"));
    syncSetting("glitch");
    screen?.classList.toggle("glitch", localStorage.glitch === "1");
  },

  // Toggles document fullscreen. Rejections are expected in some browser/user contexts.
  fullscreen: async () => {
    try {
      document.fullscreenElement
        ? await document.exitFullscreen()
        : await document.documentElement.requestFullscreen();
    } catch (_) {}
  },

  // Plays shelf animation and removes the class once done.
  shelf: async () => {
    shutter?.classList.add("shelf");
    await (shutter && waitAnimation(shutter, "shelf"));
    shutter?.classList.remove("shelf");
  },
};

// Event delegation for all actionable elements via [data-action].
["click", "change"].forEach((type) =>
  document.addEventListener(type, async ({ target }) => {
    const actionElement = target.closest("[data-action]");
    if (!actionElement) return;

    // Avoid double-triggering form controls:
    // - click skips form fields
    // - change only accepts inputs
    if (type === "click" && actionElement.matches("input, select, textarea")) return;
    if (type === "change" && !actionElement.matches("input")) return;

    // `data-action` supports pipelines like: "shader|shutter:turn-on"
    for (const chunk of actionElement.dataset.action.split("|")) {
      const [name, value] = chunk.trim().split(":");
      await actions[name]?.({ element: actionElement, value });
    }
  })
);

// Bootstraps persisted UI state and immediately applies related visual effects.
["shader", "glitch"].forEach((name) => {
  localStorage[name] ??= "1";
  syncSetting(name);
  actions[name]?.({ element: document.querySelector(`input[name="${name}"]`), value: localStorage[name] });
});
