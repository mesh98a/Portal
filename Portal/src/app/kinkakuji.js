import * as THREE from "three";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createARButton, createVRButton } from './xr-buttons.js';

const canvas = document.getElementById("xr-canvas");

//RENDERER
const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true, 
    alpha: true, 
    stencil: true, 
});

renderer.xr.enabled = true;
renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;

//CREATE SCENE AND CAMERA
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 200);
camera.position.set(0, 1.2, 3);

const arGroup = new THREE.Group();
const vrGroup = new THREE.Group();
scene.add(arGroup);
scene.add(vrGroup);

arGroup.scale.set(2,2,2);

//CREATE XRBUTTONS
//const arbtn = createARButton(renderer);
const vrbtn = createVRButton(renderer);


//CREATE LIGHT
vrGroup.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1.0));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(2, 3, 1);
vrGroup.add(dir);

//CREATE PLANE
const planeWidth = 500;
const planeHeight =  500;
const planeGeometry = new THREE.PlaneGeometry(
    planeWidth,
    planeHeight
);

//Textur laden
const texLoader = new THREE.TextureLoader();
const tex = await texLoader.loadAsync("/textures/rocky_terrain_02_diff_4k.jpg");
tex.colorSpace = THREE.SRGBColorSpace;
tex.wrapS = THREE.RepeatWrapping;
tex.wrapT = THREE.RepeatWrapping;
tex.repeat.set(16, 16);

//Material mit Textur
const planeMat = new THREE.MeshStandardMaterial({ map: tex });
//Mesh
const plane = new THREE.Mesh(planeGeometry, planeMat);
plane.rotation.x = - Math.PI / 2;
plane.receiveShadow = true;

//add to vrGroup
vrGroup.add(plane);
applyPortalStencil(plane);

//Skybox
const skytexture = await new THREE.TextureLoader().loadAsync("/Skyboxes/forest_slope_4k.png");
skytexture.colorSpace = THREE.SRGBColorSpace;
skytexture.mapping = THREE.EquirectangularReflectionMapping;
scene.background = skytexture;
scene.environment = skytexture;

renderer.xr.addEventListener("sessionstart", () => {
  const s = renderer.xr.getSession();
  const isAR = s?.mode === "immersive-ar";

  if (isAR) {
    scene.background = null;        // Skybox aus in AR
    // optional: Environment in AR auch aus, je nach Look
    // scene.environment = null;
  } else {
    scene.background = skytexture;  // an in VR
    scene.environment = skytexture;
  }
});

renderer.xr.addEventListener("sessionend", () => {
  // zurück auf Desktop/Default
  scene.background = skytexture;
  scene.environment = skytexture;
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//FÜR GUI CONTROLS
const controls = { mouseSensitivity: 0.002, moveSpeed: 2.5 };

//GUI ANLEGEN
var gui = new dat.GUI();
gui.add(controls, 'mouseSensitivity', 0.0005, 0.01);
gui.add(controls, "moveSpeed", 0.5, 10.0);    

//EVENTLISTENER FÜR KEYBOARD INPUT
const keyboard ={};
window.addEventListener('keydown', function(event) {
    keyboard[event.code] = true;
});
window.addEventListener('keyup', function(event) {
    keyboard[event.code] = false;
});

//event listener für mouse input
canvas.addEventListener('click', function () {
    canvas.requestPointerLock();
});

var yaw = 0;
var pitch = 0;

window.addEventListener('mousemove', function (event) {
    if (document.pointerLockElement !== canvas) return;

    yaw   -= event.movementX * controls.mouseSensitivity;
    pitch -= event.movementY * controls.mouseSensitivity;

    const maxPitch = Math.PI / 2 - 0.01;
    if (pitch >  maxPitch) pitch =  maxPitch;
    if (pitch < -maxPitch) pitch = -maxPitch;

    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
});

//FÜR WASD CONTROLS
function handleKeyboardInput(delta) {
    const dx = (keyboard['KeyD'] ? 1 : 0) - (keyboard['KeyA'] ? 1 : 0);
    const dz = (keyboard['KeyW'] ? 1 : 0) - (keyboard['KeyS'] ? 1 : 0);

    if (dx === 0 && dz === 0) return;

    const forward = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3()
        .crossVectors(forward, camera.up)
        .normalize();

    const move = new THREE.Vector3();
    move.addScaledVector(right, dx * controls.moveSpeed * delta);
    move.addScaledVector(forward, dz * controls.moveSpeed * delta);

    camera.position.add(move);

}

const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();

  if (!renderer.xr.isPresenting) {
    handleKeyboardInput(delta);
  }

  const s = renderer.xr.getSession();
  const isAR = s?.mode === "immersive-ar";

  renderer.clear(!isAR, true, true); // AR: color nicht clearen
  renderer.render(scene, camera);
});






//OBJEKTE LADEN VR
//Geometry Testobject
/* const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial()
);
cube.position.set(0, 0.5, 0);
vrGroup.add(cube); */

//gltf-loader für .gltf-dateien
const gltfLoader = new GLTFLoader();

//load Kinkakuji
gltfLoader.load(
        '/Assets/Kinkakuji/scene.gltf',
        function (gltf) {
            const tempel = gltf.scene;

            tempel.position.set(-10, 0, -30);
            tempel.scale.set(1, 1, 1);
            tempel.rotation.set(0, 0, 0);

            tempel.traverse(function (obj) {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
            });

            vrGroup.add(tempel);
            tempel.traverse(applyPortalStencil);
            tempel.traverse(o => { if (o.isMesh) o.renderOrder = 2; });
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log(error);
            console.log('An error happened');
        }
    );



//OBJEKTE LADEN AR
const position = new THREE.Vector3(0, 1, 0);
//Rahmen 
const frame = new THREE.Mesh(
  new THREE.TorusGeometry(1.5, 0.05, 16, 64),
  new THREE.MeshStandardMaterial()
);
//frame.position.copy(position);
arGroup.add(frame);

//Portal-Maske
const portalMask = new THREE.Mesh(
  new THREE.CircleGeometry(1.45, 64),
  new THREE.MeshBasicMaterial({ colorWrite: false })
);

portalMask.material.stencilWrite = true;
portalMask.material.stencilRef = 1;
portalMask.material.stencilFunc = THREE.AlwaysStencilFunc;
portalMask.material.stencilZPass = THREE.ReplaceStencilOp;
portalMask.material.stencilZFail = THREE.ReplaceStencilOp;
portalMask.material.stencilFail  = THREE.ReplaceStencilOp;
portalMask.material.depthTest = false;
portalMask.material.depthWrite = false;
portalMask.material.side = THREE.DoubleSide; // optional, aber sinnvoll
portalMask.renderOrder = 1000; 

frame.renderOrder = 0;
portalMask.renderOrder = 1;
//portalMask.position.copy(position);
arGroup.add(portalMask);

vrGroup.traverse(applyPortalStencil);
vrGroup.traverse(o => { if (o.isMesh) o.renderOrder = 2000; });

vrGroup.position.copy(arGroup.position);
vrGroup.quaternion.copy(arGroup.quaternion);
vrGroup.translateZ(-5);



function applyPortalStencil(obj) {
  if (!obj.isMesh) return;

  const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
  for (const m of mats) {
    m.stencilWrite = true;
    m.stencilRef = 1;
    m.stencilFunc = THREE.EqualStencilFunc;
    m.stencilFail = THREE.KeepStencilOp;
    m.stencilZFail = THREE.KeepStencilOp;
    m.stencilZPass = THREE.KeepStencilOp;
    m.needsUpdate = true;
  }
}

