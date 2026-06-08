const HAND_SIZE = 3;
const MAX_PLAYS_PER_TURN = 2;

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function createInitialState() {
  return {
    phase: "WORLD_SELECT", // WORLD_SELECT | PLAYER_TURN | LEVEL_END | GAME_OVER
    worldId: null,
    levelIndex: 0,
    stability: 50,
    draw: [],
    hand: [],
    discard: [],
    intent: null,
    winner: null,
    playsThisTurn: 0
  };
}

export function getWorld(data, worldId) {
  return data.worlds.find((w) => w.id === worldId) || null;
}

export function getLevel(data, state) {
  const world = getWorld(data, state.worldId);
  if (!world) return null;
  return world.levels[state.levelIndex] || null;
}

export function getCardById(data, cardId) {
  return data.cards.find((c) => c.id === cardId) || null;
}

function recycleIfNeeded(draw, discard) {
  if (draw.length === 0 && discard.length > 0) {
    return { draw: shuffle(discard), discard: [] };
  }
  return { draw, discard };
}

function drawUpTo(state, targetHandSize = HAND_SIZE) {
  let draw = [...state.draw];
  let hand = [...state.hand];
  let discard = [...state.discard];

  while (hand.length < targetHandSize) {
    ({ draw, discard } = recycleIfNeeded(draw, discard));
    if (draw.length === 0) break;
    hand.push(draw.shift());
  }

  return { ...state, draw, hand, discard };
}

function pickIntent(level) {
  if (!level?.intents?.length) return null;
  const i = Math.floor(Math.random() * level.intents.length);
  return level.intents[i];
}

function setupTurn(state, level) {
  let next = drawUpTo(state, HAND_SIZE);
  next.intent = pickIntent(level);
  next.playsThisTurn = 0;
  return next;
}

function initLevelState(state, data, levelIndex) {
  return {
    ...state,
    phase: "PLAYER_TURN",
    levelIndex,
    stability: 50,
    draw: shuffle(data.starterDeck),
    hand: [],
    discard: [],
    intent: null,
    winner: null,
    playsThisTurn: 0
  };
}

function checkTerminalAfterStability(stateLike) {
  if (stateLike.stability <= 0) {
    return {
      ...stateLike,
      stability: 0,
      phase: "GAME_OVER",
      winner: "system",
      intent: null
    };
  }
  if (stateLike.stability >= 100) {
    return {
      ...stateLike,
      stability: 100,
      phase: "LEVEL_END",
      intent: null
    };
  }
  return null;
}

function finalizeTurn(state, data) {
  // Cartes restantes en main -> défausse
  const discard = [...state.discard, ...state.hand];
  let next = {
    ...state,
    hand: [],
    discard
  };

  // Intent système (une seule fois, en fin de tour)
  if (next.intent) {
    next.stability = clamp(next.stability + next.intent.stability, 0, 100);
  }

  // Vérif fin de partie / niveau
  const terminal = checkTerminalAfterStability(next);
  if (terminal) return terminal;

  // Nouveau tour
  const level = getLevel(data, next);
  if (!level) {
    return { ...next, phase: "GAME_OVER", winner: "system", intent: null };
  }

  next.intent = null;
  next.playsThisTurn = 0;
  next = setupTurn(next, level);
  return next;
}

export function endTurn(state, data) {
  if (state.phase !== "PLAYER_TURN") return state;
  return finalizeTurn(state, data);
}

export function selectWorld(state, data, worldId) {
  const world = getWorld(data, worldId);
  if (!world || !world.levels.length) return state;

  const base = {
    ...state,
    worldId,
    winner: null
  };

  let next = initLevelState(base, data, 0);
  next = setupTurn(next, world.levels[0]);
  return next;
}

export function playCard(state, data, cardId) {
  if (state.phase !== "PLAYER_TURN") return state;
  if (!state.hand.includes(cardId)) return state;
  if (state.playsThisTurn >= MAX_PLAYS_PER_TURN) return state;

  const card = getCardById(data, cardId);
  if (!card) return state;

  // Retire la carte jouée
  const hand = [...state.hand];
  const idx = hand.indexOf(cardId);
  hand.splice(idx, 1);

  // Carte jouée -> défausse immédiate
  const discard = [...state.discard, cardId];

  // Effet joueur
  const stability = clamp(state.stability + card.stability, 0, 100);

  let next = {
    ...state,
    hand,
    discard,
    stability,
    playsThisTurn: state.playsThisTurn + 1
  };

  // Vérif fin immédiate
  const terminal = checkTerminalAfterStability(next);
  if (terminal) return terminal;

  // 2 cartes jouées => fin auto du tour
  if (next.playsThisTurn >= MAX_PLAYS_PER_TURN) {
    return finalizeTurn(next, data);
  }

  // Sinon le joueur peut jouer encore 1 carte ou terminer le tour
  return next;
}

export function goToNextLevel(state, data) {
  const world = getWorld(data, state.worldId);
  if (!world) return state;

  const nextIndex = state.levelIndex + 1;
  const nextLevel = world.levels[nextIndex];

  if (!nextLevel) {
    return {
      ...state,
      phase: "GAME_OVER",
      winner: "player",
      intent: null
    };
  }

  let next = initLevelState(state, data, nextIndex);
  next = setupTurn(next, nextLevel);
  return next;
}
