const actions = {
  dialog: ({ dataset }) => document.getElementById(dataset.target)?.showModal(),
  shader: ({ value }) => {
    localStorage.shader = value;
    document.querySelector("#title")?.classList.toggle("shader", value == 1);
  },
  glitch: ({ value }) => {
    localStorage.glitch = value;
    document.body.classList.toggle("aberration", value == 1);
  },
  fullscreen: () =>
    document.fullscreenElement
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen(),
};

["click", "change"].forEach((type) => {
  document.addEventListener(type, (event) => {
    const element = event.target.closest("[data-action]");
    element && actions[element.dataset.action]?.(element);
  });
});

["shader", "glitch"].forEach(name => {
  const value = localStorage[name] ?? 1;
  actions[name]({ value });
  document.querySelector(`input[name="${name}"][value="${value}"]`).checked = true;
});
