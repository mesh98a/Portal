import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';
import { UltraHDRLoader } from 'three/examples/jsm/loaders/UltraHDRLoader.js';

const canvas = document.getElementById('xr-canvas');
const renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);


const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, -1000);

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const loader = new HDRLoader();
const envMap = await loader.loadAsync( 'kin.hdr' );
envMap.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = envMap;
scene.background = envMap;

const skytexture = await new THREE.TextureLoader().loadAsync(".../public/Skyboxes/mossyforest.png");
texture.colorSpace = THREE.SRGBColorSpace;
texture.mapping = THREE.EquirectangularReflectionMapping;
scene.background = skytexture;

function animate(t = 0) {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  orbit.update();
}

animate();