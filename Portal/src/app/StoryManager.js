import * as THREE from 'three';

export class StoryManager {
  constructor(ctx) {
    this.ctx = ctx; // z.B. vrGroup, vrScene, player, audio...
    this.active = false;
    this.time = 0;
    this.index = 0;
    this.timeline = [];
  }

  start(name) {
    this.timeline = this._buildTimeline(name);
    this.active = true;
    this.time = 0;
    this.index = 0;
  }

  stop() {
    this.active = false;
    const sounds = this.ctx.sounds;
    if (sounds) {
        for (const key of Object.keys(sounds)) {
        const s = sounds[key];
        try {
            if (s?.isPlaying) s.stop();
        } catch (e) {
            console.warn("Failed to stop sound:", key, e);
        }
        }
    }
  }

  update(dt) {
    if (!this.active) return;
    this.time += dt;

    while (this.index < this.timeline.length && this.time >= this.timeline[this.index].t) {
      this.timeline[this.index].run(this.ctx);
      this.index++;
    }

    const timelineDone = this.index >= this.timeline.length;
    const fadesDone = !(this.ctx._fades?.length);

    if (timelineDone && fadesDone) {
    this.active = false;
    }

    // Fades updaten
    if (this.ctx._fades?.length) {
    for (const f of this.ctx._fades) {
        f.t += dt;
        const a = Math.min(1, f.t / f.dur);
        f.s.setVolume(f.start + f.delta * a);
    }
    this.ctx._fades = this.ctx._fades.filter(f => f.t < f.dur);
    //console.log("vol", this.ctx.sounds.surroundings?.getVolume());
    }
  }

  //*  -------------- TIMELINE -------------- *//
  _buildTimeline(name) {
    if (name === "vr_intro") {
      return [
        { t: 0.0, run: (ctx) => console.log("VR Story Start") },

        // 0) ambience starten, damit ctx.sounds.surroundings existiert
        { t: 0.0, run: (ctx) => playLoop(ctx, "surroundings", { volume: 0.5 }) },

        // 1) später: surroundings ducking + narrator startet
        { t: 4.0, run: (ctx) => {
            // surroundings sanft leiser (aber NICHT stoppen)
            fadeTo(ctx, "surroundings", 0.15, 3.0);

            // narrator1 starten (inline, ohne neue Helper)
            ctx.sounds ??= {};

            if (!ctx.sounds.narrator1?.isPlaying) {
            const buffer = ctx.vrGroup?.userData?.audioBuffers?.narrator1;
            if (!buffer || !ctx.listener) return;

            const narrator = new THREE.Audio(ctx.listener);
            narrator.setBuffer(buffer);
            narrator.setLoop(false);
            narrator.setVolume(1.0);
            narrator.play();

            ctx.sounds.narrator1 = narrator;
            }
        }},
      ];
    }
    return [];
  }
}









//*  -------------- HELPER FUNKTIONEN -------------- *//

function ensureSounds(ctx) {
  ctx.sounds ??= {};
}

export function playLoop(ctx, key, { volume = 0.5 } = {}) {
  ensureSounds(ctx);

  // nicht doppelt starten
  if (ctx.sounds[key]?.isPlaying) return;

  const buffer = ctx.vrGroup?.userData?.audioBuffers?.[key];
  if (!buffer || !ctx.listener) return;

  const sound = new THREE.Audio(ctx.listener);
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(volume);
  sound.play();

  ctx.sounds[key] = sound;
}

export function stopSound(ctx, key) {
  const s = ctx.sounds?.[key];
  if (s && s.isPlaying) s.stop();
}

export function fadeTo(ctx, key, targetVolume, seconds = 1.0) {
  const s = ctx.sounds?.[key];
  if (!s) return;

  const start = s.getVolume();
  const delta = targetVolume - start;

  ctx._fades ??= [];
  ctx._fades.push({ key, s, start, delta, t: 0, dur: Math.max(0.001, seconds) });
}

export function playOnce(ctx, key, { volume = 1.0 } = {}) {
  ensureSounds(ctx);

  const buffer = ctx.vrGroup?.userData?.audioBuffers?.[key];
  if (!buffer || !ctx.listener) return;

  // optional: wenn schon läuft, nicht neu starten
  if (ctx.sounds[key]?.isPlaying) return;

  const sound = new THREE.Audio(ctx.listener);
  sound.setBuffer(buffer);
  sound.setLoop(false);
  sound.setVolume(volume);
  sound.play();

  ctx.sounds[key] = sound;
}
