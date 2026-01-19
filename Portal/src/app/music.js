import * as THREE from "three";


export async function loadBackgroundMusic(path, audioListener) {
    const audioLoader = new THREE.AudioLoader();
    const backgroundMusic = new THREE.Audio(audioListener);

    const buffer = await new Promise((resolve, reject) => {
        audioLoader.load(path, resolve, undefined, reject);
    });

    backgroundMusic.setBuffer(buffer);
    backgroundMusic.setLoop(true);
    backgroundMusic.setVolume(0.7);

    return [backgroundMusic, true];
}