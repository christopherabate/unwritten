import data from "./data/gameData.json";
import {
  createInitialState,
  selectWorld,
  playCard,
  endTurn,
  goToNextLevel,
  getWorld,
  getLevel,
  getCardById
} from "./game-engine";

let state = createInitialState();
let logs = [];

/* -------------------- Helpers -------------------- */

function fmtSigned(n) {
  return n > 0 ? `+${n}` : `${n}`;
}

function cardById(id) {
  return getCardById(data, id);
}

function cardLabel(id) {
  const c = cardById(id);
  return c ? `${c.name} (${fmtSigned(c.stability)})` : `${id} (?)`;
}

function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function mk(tag, text = "") {
  const n = document.createElement(tag);
  if (text) n.textContent = text;
  return n;
}

function addLog(msg) {
  logs.unshift(msg);
  if (logs.length > 30) logs = logs.slice(0, 30);
}

function pilesTotal(s) {
  return s.draw.length + s.hand.length + s.discard.length;
}

/* -------------------- Actions -------------------- */

function actionSelectWorld(worldId) {
  state = selectWorld(state, data, worldId);
  const world = getWorld(data, worldId);
  addLog(`Monde sélectionné: ${world?.title ?? worldId}`);
  render();
}

function actionPlay(cardId) {
  const beforeIntent = state.intent;
  const beforeStability = state.stability;
  const beforePlays = state.playsThisTurn;
  const card = cardById(cardId);

  state = playCard(state, data, cardId);

  const parts = [];
  parts.push(`Joué: ${card ? card.name : cardId}`);
  parts.push(`Stabilité: ${beforeStability} -> ${state.stability}`);
  parts.push(`Actions: ${beforePlays} -> ${state.playsThisTurn}`);
  if (beforeIntent) {
    parts.push(`Intent: ${beforeIntent.name} (${fmtSigned(beforeIntent.stability)})`);
  }
  addLog(parts.join(" | "));

  render();
}

function actionEndTurn() {
  const before = state.stability;
  const intentName = state.intent?.name ?? "-";
  state = endTurn(state, data);
  addLog(`Tour terminé | Intent: ${intentName} | Stabilité: ${before} -> ${state.stability}`);
  render();
}

function actionNextLevel() {
  const prev = state.levelIndex;
  state = goToNextLevel(state, data);
  addLog(`Niveau ${prev} terminé -> niveau ${state.levelIndex} | stabilité=${state.stability}`);
  render();
}

function actionRestart() {
  state = createInitialState();
  logs = [];
  addLog("Nouvelle partie");
  render();
}

/* -------------------- Render sections -------------------- */

function renderStateSection(root) {
  const fs = mk("fieldset");
  fs.appendChild(mk("legend", "État"));

  const world = getWorld(data, state.worldId);
  const level = getLevel(data, state);

  fs.appendChild(mk("div", `Phase: ${state.phase}`));
  fs.appendChild(mk("div", `Monde: ${world?.title ?? "-"}`));
  fs.appendChild(mk("div", `Niveau: ${level?.title ?? "-"}`));
  fs.appendChild(mk("div", `Stabilité: ${state.stability}/100`));
  fs.appendChild(mk("div", `Actions jouées ce tour: ${state.playsThisTurn ?? 0}/2`));
  fs.appendChild(
    mk(
      "div",
      `Intent: ${
        state.intent ? `${state.intent.name} (${fmtSigned(state.intent.stability)})` : "-"
      }`
    )
  );

  root.appendChild(fs);
}

function renderWorldSelectSection(root) {
  if (state.phase !== "WORLD_SELECT") return;

  const fs = mk("fieldset");
  fs.appendChild(mk("legend", "Choix du monde"));

  data.worlds.forEach((w) => {
    const btn = mk("button", w.title);
    btn.onclick = () => actionSelectWorld(w.id);
    fs.appendChild(btn);
    fs.appendChild(document.createTextNode(" "));
  });

  root.appendChild(fs);
}

function renderHandSection(root) {
  if (state.phase !== "PLAYER_TURN") return;

  const fs = mk("fieldset");
  fs.appendChild(mk("legend", "Main"));

  if (!state.hand.length) {
    fs.appendChild(mk("div", "Aucune carte en main"));
  } else {
    state.hand.forEach((id) => {
      const btn = mk("button", `Jouer ${cardLabel(id)}`);
      btn.onclick = () => actionPlay(id);
      fs.appendChild(btn);
      fs.appendChild(document.createElement("br"));
    });
  }

  fs.appendChild(document.createElement("br"));
  const endBtn = mk("button", "Terminer le tour");
  endBtn.onclick = actionEndTurn;
  fs.appendChild(endBtn);

  root.appendChild(fs);
}

function renderLevelEndSection(root) {
  if (state.phase !== "LEVEL_END") return;

  const fs = mk("fieldset");
  fs.appendChild(mk("legend", "Fin de niveau"));
  fs.appendChild(mk("div", "Bravo, niveau terminé ✅"));

  const btn = mk("button", "Passer au niveau suivant");
  btn.onclick = actionNextLevel;
  fs.appendChild(btn);

  root.appendChild(fs);
}

function renderGameOverSection(root) {
  if (state.phase !== "GAME_OVER") return;

  const fs = mk("fieldset");
  fs.appendChild(mk("legend", "Fin de partie"));

  const result =
    state.winner === "player" ? "Victoire joueur 🎉" : "Défaite système 💥";
  fs.appendChild(mk("div", `Résultat: ${result}`));

  const btn = mk("button", "Recommencer");
  btn.onclick = actionRestart;
  fs.appendChild(btn);

  root.appendChild(fs);
}

function renderPilesSection(root) {
  if (state.phase === "WORLD_SELECT") return;

  const fs = mk("fieldset");
  fs.appendChild(mk("legend", "Piles"));

  fs.appendChild(
    mk("div", `DRAW (${state.draw.length}): ${state.draw.map(cardLabel).join(" | ") || "-"}`)
  );
  fs.appendChild(
    mk("div", `HAND (${state.hand.length}): ${state.hand.map(cardLabel).join(" | ") || "-"}`)
  );
  fs.appendChild(
    mk(
      "div",
      `DISCARD (${state.discard.length}): ${state.discard.map(cardLabel).join(" | ") || "-"}`
    )
  );
  fs.appendChild(
    mk("div", `TOTAL CARTES: ${pilesTotal(state)} (attendu: ${data.starterDeck.length})`)
  );

  root.appendChild(fs);
}

function renderLogsSection(root) {
  const fs = mk("fieldset");
  fs.appendChild(mk("legend", "Historique"));

  if (!logs.length) {
    fs.appendChild(mk("div", "Aucun événement"));
  } else {
    const ul = mk("ul");
    logs.forEach((line) => {
      const li = mk("li", line);
      ul.appendChild(li);
    });
    fs.appendChild(ul);
  }

  root.appendChild(fs);
}

/* -------------------- Render root -------------------- */

function render() {
  const app = document.querySelector("#app");
  clear(app);

  app.appendChild(mk("h1", "Jeu de Stabilité"));

  renderStateSection(app);
  renderWorldSelectSection(app);
  renderHandSection(app);
  renderLevelEndSection(app);
  renderGameOverSection(app);
  renderPilesSection(app);
  renderLogsSection(app);
}

render();
