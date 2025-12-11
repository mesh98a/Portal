import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Szene, Kamera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const canvas = document.getElementById('xr-canvas');
const renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});
renderer.setSize(window.innerWidth, window.innerHeight);


let materialArray = [];
let texture_ft = new THREE.TextureLoader().load( 'row-1-column-1.png');
let texture_bk = new THREE.TextureLoader().load( 'row-1-column-2.png');
let texture_up = new THREE.TextureLoader().load( 'row-1-column-3.png');
let texture_dn = new THREE.TextureLoader().load( 'row-1-column-4.png');
let texture_rt = new THREE.TextureLoader().load( 'row-1-column-5.png');
let texture_lf = new THREE.TextureLoader().load( 'row-1-column-6.png');
  
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));
for (let i = 0; i < 6; i++)
  materialArray[i].side = THREE.BackSide;
   
let skyboxGeo = new THREE.BoxGeometry( 50, 50, 50);
let skybox = new THREE.Mesh( skyboxGeo, materialArray )
scene.add(skybox);


//scene.add(panoSphere);
let controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 500;
controls.maxDistance = 1500;


camera.position.set(0, 0, 0);
skybox.position.set(0, 0, 0);

// Render-Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
