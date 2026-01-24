import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export async function initVRGroup() {

    const vrGroup = new THREE.Group();
    //vrGroup.visible = false;
    //scene.add(vrGroup);

    /* ---------- LIGHT ---------- */
    vrGroup.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1.0));

    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(2, 3, 1);
    dir.castShadow = true;
    vrGroup.add(dir);

    /* ---------- GROUND PLANE ---------- */
    const planeGeometry = new THREE.PlaneGeometry(500, 500);

    const texLoader = new THREE.TextureLoader();
    const groundTex = await texLoader.loadAsync(
        "/textures/rocky_terrain_02_diff_4k.jpg"
    );

    groundTex.colorSpace = THREE.SRGBColorSpace;
    groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(16, 16);

    const planeMat = new THREE.MeshStandardMaterial({ map: groundTex });
    const plane = new THREE.Mesh(planeGeometry, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;

    vrGroup.add(plane);
    //applyPortalStencil(plane);

    /* ---------- GLTF MODEL ---------- */
    const gltfLoader = new GLTFLoader();

    const gltf = await gltfLoader.loadAsync('/Assets/Kinkakuji/scene.gltf');
    const tempel = gltf.scene;
    tempel.position.set(-10, 0, -30);
    vrGroup.add(tempel);

    //um später tempel objekt wieder abrufen zu können
    vrGroup.userData.temple = tempel;


    /* ---------- AUDIO LADEN ---------- */
    // Quellen: https://pixabay.com/de/sound-effects/natur-mountain-forest-high-quality-sound-176826/

    const audioLoader = new THREE.AudioLoader();
    const surroundingsBuffer  = await audioLoader.loadAsync("/audio/mountain-forest-high-quality-sound.mp3");
    const narratorBuffer1 = await audioLoader.loadAsync("/audio/Erzähler_Einleitung_Wilhelm - Mature Narrator.mp3");

    vrGroup.userData.audioBuffers = {
        surroundings: surroundingsBuffer,
        narrator1: narratorBuffer1,
    };
    return vrGroup;
}

async function loadAudioBuffer(url) {
  const loader = new THREE.AudioLoader();
  return await loader.loadAsync(url);
}

