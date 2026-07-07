const screen = document.querySelector(".screen");
const shutter = document.querySelector(".screen > :first-child");

const actions = {
  shutter: ({ dataset }) => {
    shutter?.classList.remove("turn-off", "turn-on");
    shutter?.classList.add(dataset.target);
  },
  standby: () => {
    shutter?.classList.remove("turn-off", "turn-on");
    shutter?.classList.add("standby");
  },
  dialog: ({ dataset }) => document.getElementById(dataset.target)?.showModal(),
  shader: ({ value }) => {
    localStorage.shader = value;
    shutter?.classList.toggle("shader", value == 1);
  },
  glitch: ({ value }) => {
    localStorage.glitch = value;
    screen?.classList.toggle("aberration", value == 1);
  },
  fullscreen: () => {
    document.fullscreenElement
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen();
  },
};

shutter?.addEventListener("animationend", (event) => {
  event.animationName === "standby" && event.currentTarget.classList.remove("standby");
});

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
