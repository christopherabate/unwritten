const actions = {
  dialog: (element) => document.getElementById(element.dataset.target)?.showModal(),
  shader: (element) => document.querySelector("body > main > div")?.classList.toggle("shader", element.value === "1"),
  glitch: (element) => document.body.classList.toggle("aberration", element.value === "1"),
  fullscreen: () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(),
};

["click", "change"].forEach((type) => {
  document.addEventListener(type, (event) => {
    const element = event.target.closest("[data-action]");
    element && actions[element.dataset.action]?.(element);
  });
});
