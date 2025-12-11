import { initScene } from "./app/scene.js";
import * as THREE from 'three';
import { initARScene } from "./app/interactions.js";




window.addEventListener('DOMContentLoaded', () => {
    const { scene, camera, renderer } = initScene();
    initARScene(scene, camera, renderer);

});
