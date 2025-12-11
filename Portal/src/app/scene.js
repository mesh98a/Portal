import * as THREE from 'three';
import { createARButton } from './xr-buttons.js';
import { initARScene } from './interactions.js';

export function initScene() {

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

     renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });

    return { scene, camera, renderer };
}

