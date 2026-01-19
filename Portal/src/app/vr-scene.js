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

    gltfLoader.load(
        '/Assets/Kinkakuji/scene.gltf',
        (gltf) => {
            const tempel = gltf.scene;

            tempel.position.set(-10, 0, -30);
            tempel.scale.set(1, 1, 1);
            vrGroup.add(tempel);
            /*     tempel.traverse(obj => {
                    if (obj.isMesh) {
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                    obj.renderOrder = 2;
                    }
                });
        
                vrGroup.add(tempel);
                tempel.traverse(applyPortalStencil); */
        },
        undefined,
        (error) => console.error(error)
    );

    return vrGroup;
}

