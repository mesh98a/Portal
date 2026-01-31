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

    const fire = this.ctx.vrGroup?.userData?.fire;
    if (fire?.update) {
      fire.update(dt);
    }
  }

  /*Animationen--> 
  0 = idle warrior ?? buggy
  1 = dismiss handgeste
  2 = walking
  3 = handgeste verzweiflung oder so 
  4 = head shake no
  5 = normal idle
  6 = handgesten 
  7 = head shake
  8 = 
  
  */
  //*  -------------- TIMELINE -------------- *//
  _buildTimeline(name) {
    if (name === "vr_intro") {
      return [

        //Debug print
        { t: 0.0, run: (ctx) => console.log("VR Story Start") },

        // 0) ambience sound starten
        { t: 0.0, run: (ctx) => playLoop(ctx, "surroundings", { volume: 0.5 }) },

        // 1) surroundings ducking + narrator startet
        { t: 4.0, run: (ctx) => {
            // surroundings sanft leiser (aber NICHT stoppen)
            fadeTo(ctx, "surroundings", 0.15, 3.0);

            // narrator1 starten
            playOnce(ctx, "narrator1");
        }},
        // 2) Mönchsgedanken starten
        {t: 63.0, run: (ctx) => {
          playOnce(ctx, "monk");
        }},
        //Geste 1
        { t: 63.0, run: (ctx) => {
            const mixer = ctx.vrGroup.userData.mixer;
            const clips = ctx.vrGroup.userData.clips;
            if (mixer && clips) {
                const action = mixer.clipAction(clips[4]);
                action.reset().fadeIn(0.5).play();
            }
        }},
        //Geste 2
        { t: 67.0, run: (ctx) => {
            const mixer = ctx.vrGroup.userData.mixer;
            const clips = ctx.vrGroup.userData.clips;
            if (mixer && clips) {
                const action = mixer.clipAction(clips[3]);
                action.reset().fadeIn(0.5).play();
            }
        }},
        //Geste 3
        { t: 76.0, run: (ctx) => {
            const mixer = ctx.vrGroup.userData.mixer;
            const clips = ctx.vrGroup.userData.clips;
            if (mixer && clips) {
                const action = mixer.clipAction(clips[1]);
                action.reset().fadeIn(0.5).play();
            }
        }},
        //Geste 4
        { t: 80.0, run: (ctx) => {
            const mixer = ctx.vrGroup.userData.mixer;
            const clips = ctx.vrGroup.userData.clips;
            if (mixer && clips) {
                const action = mixer.clipAction(clips[6]);
                action.reset().fadeIn(0.5).play();
            }
        }},
        //Geste 5
        { t: 94.0, run: (ctx) => {
            const mixer = ctx.vrGroup.userData.mixer;
            const clips = ctx.vrGroup.userData.clips;
            if (mixer && clips) {
                const action = mixer.clipAction(clips[5]);
                action.reset().fadeIn(0.5).play();
            }
        }},
        {t: 98.0, run: (ctx) => {
          playOnce(ctx, "narrator2");
        }},
        { t: 103.0, run: (ctx) => ctx.vrGroup.userData.fireA.start() },
        { t: 103.0, run: (ctx) => ctx.vrGroup.userData.fireB.start() },
        { t: 103.0, run: (ctx) => ctx.vrGroup.userData.fireC.start() },
        { t: 103.0, run: (ctx) => ctx.vrGroup.userData.fireD.start()},
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

  if (ctx.sounds[key]?.isPlaying) return;

  const sound = new THREE.Audio(ctx.listener);
  sound.setBuffer(buffer);
  sound.setLoop(false);
  sound.setVolume(volume);
  sound.play();

  ctx.sounds[key] = sound;
}
