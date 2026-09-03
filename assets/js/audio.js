import * as settings from './settings.js';

const audio = {
  context: new AudioContext(),
  buffers: {},
  gains: {}
};

export const play = async (type, name, loop = false) => {
  if (!audio.buffers[type]) audio.buffers[type] = {};

  if (!audio.buffers[type][name]) {
    try {
      const response = await fetch(`./assets/audio/${type}/${name}.ogg`);

      if (!response.ok) return;

      audio.buffers[type][name] = await audio.context.decodeAudioData(await response.arrayBuffer());
    } catch (_) { return; }
  }

  await audio.context.resume();

  const source = audio.context.createBufferSource();

  source.buffer = audio.buffers[type][name];
  source.loop = loop;
  source.connect(audio.gains[type] ?? audio.context.destination);
  source.start();

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
  console.log(event);
  try {
    const source = await play('effects', event.detail.value);
  } catch (_) {}
});