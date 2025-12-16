import * as THREE from "three";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.getElementById("xr-canvas");

//RENDERER
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;

//CREATE SCENE AND CAMERA
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 200);
camera.position.set(0, 1.2, 3);

//CREATE LIGHT
scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1.0));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(2, 3, 1);
scene.add(dir);

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
//add to scene
scene.add(plane);

//Skybox
const skytexture = await new THREE.TextureLoader().loadAsync("/Skyboxes/forest_slope_4k.png");
skytexture.colorSpace = THREE.SRGBColorSpace;
skytexture.mapping = THREE.EquirectangularReflectionMapping;
scene.background = skytexture;

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
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  handleKeyboardInput(delta);
  renderer.render(scene, camera);
}
animate();














//OBJEKTE LADEN
//Geometry Testobject
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial()
);
cube.position.set(0, 0.5, 0);
scene.add(cube);

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

            scene.add(tempel);
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log(error);
            console.log('An error happened');
        }
    );