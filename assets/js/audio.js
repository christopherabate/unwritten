import * as settings from './settings.js';

const CROSSFADE = 1;

const audio = {
  context: new AudioContext(),
  buffers: {},
  gains: {},
  sources: {}
};

const play = async (type, name, loop = false, sync = true) => {
  if (!audio.buffers[type]) audio.buffers[type] = {};

  if (!audio.buffers[type][name]) {
    try {
      const response = await fetch(`./assets/audio/${type}/${name}.ogg`);

      if (!response.ok) return;

      audio.buffers[type][name] = await audio.context.decodeAudioData(await response.arrayBuffer());
    } catch (_) {
      return;
    }
  }

  await audio.context.resume();

  const time = audio.context.currentTime;
  const masterGain = audio.gains[type];
  const current = audio.sources[type];

  let offset = 0;

  if (loop && current) {
    if (sync) {
      offset =
        (time - current.startedAt) %
        current.source.buffer.duration;
    }

    // Stoppe le morceau qui était déjà en fade-out
    current.fading?.source.stop();

    // Interrompt proprement son fade éventuel
    current.gain.gain.cancelScheduledValues(time);
    current.gain.gain.setValueAtTime(current.gain.gain.value, time);
    current.gain.gain.linearRampToValueAtTime(0, time + CROSSFADE);

    current.source.stop(time + CROSSFADE);
  }

  const source = audio.context.createBufferSource();
  const gain = audio.context.createGain();

  source.buffer = audio.buffers[type][name];
  source.loop = loop;

  source.connect(gain);
  gain.connect(masterGain ?? audio.context.destination);

  if (loop) {
    offset %= source.buffer.duration;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(1, time + CROSSFADE);
  }

  source.start(0, offset);

  if (loop) {
    audio.sources[type] = {
      source,
      gain,
      startedAt: time - offset,
      fading: current
    };
  }

  return source;
};

// set volume
document.addEventListener('volume', event => {
  if (!event.detail.value) return;

  const name = event.detail.value;

  if (!audio.gains[name]) {
    audio.gains[name] = audio.context.createGain();
    audio.gains[name].connect(audio.context.destination);
  }

  audio.gains[name].gain.value = Number(event.detail.element.value);

  settings.update(event);
});

// screen effects
document.addEventListener('effect', async event => {
  try {
    await play('effects', event.detail.value);
  } catch (_) {}
});

// play music
document.addEventListener('music', async event => {
  try {
    await play('music', event.detail.value, true, true);
  } catch (_) {}
});