import * as THREE from "three";
import { initVRGroup } from "./app/vr-scene.js";
import { createPortalFrame } from "./app/portal.js";
import { createARButton } from "./app/xr-buttons.js";
import { createVRButton } from "./app/xr-buttons.js";
import { createPortal } from "./app/portal.js";
import getStarfield from "./app/getStarfield.js";
import { setupWSADControls, setupVRControllers } from './app/controller.js';
import { createUI } from "./app/text.js";
import ThreeMeshUI from 'three-mesh-ui'
import { ARPortalController } from "./app/ar-scene.js";
import { VRMovementController } from "./app/vr-movement.js";
import { PortalTransitionManager } from "./app/portalTransition.js";
import { StoryManager } from "./app/StoryManager.js";
import { getParticleSystem } from './app/getParticleSystem.js';


const CONFIG = {
  player: {
    speed: 0.05,
    deadzone: 0.1
  }, portal: {
    size: { width: 6, height: 7 },
    position: { x: 0, y: 3.0, z: -3 },
    radius: 2.5,
    zoom: 1.5,
    resolution: 512
  }
};

class PortalSystem {
  constructor() {
    const { width, height, position, radius, zoom, resolution } = CONFIG.portal;
    const res = Math.max(1, CONFIG.portal.resolution || 256);

    // Renderer + Szenen
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    
    this.renderer.xr.addEventListener("sessionstart", () => {
      const session = this.renderer.xr.getSession();
      const isVR = session?.environmentBlendMode === "opaque";

      if (!this.player) return; // init() hat noch nicht setupPlayer gemacht

      if (isVR) {
        // in VR-Welt starten
        this.currentScene.remove(this.player);
        this.currentScene = this.vrScene;
        this.vrScene.add(this.player);

        //sauberer Startpunkt in VR-Welt
        this.player.position.set(0, 0, 0);
      } else {
        // AR-Session: in Portal-Szene starten
        this.currentScene.remove(this.player);
        this.currentScene = this.portalScene;
        this.portalScene.add(this.player);
      }
    });
    
    this.renderer.xr.addEventListener("sessionend", () => {
      if (!this.player) return;
      this.currentScene.remove(this.player);
      this.currentScene = this.portalScene;
      this.portalScene.add(this.player);
    });

    document.body.appendChild(this.renderer.domElement);
    const vrbtn = createVRButton(this.renderer);
    const arbtn = createARButton(this.renderer);

    this._vrAdded = false;
    
    // Hauptszene (wo der Spieler ist) + VR-Szene (die im Portal gerendert wird)
    this.portalScene = new THREE.Scene();
    this.vrScene = new THREE.Scene();

    // Kameras
    this.mainCamera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    this.mainCamera.position.set(0, 1.7, 0);

    this.portalCamera = new THREE.PerspectiveCamera(70, 1, 0.1, 500);

    // RenderTarget
    this.portalRT = new THREE.WebGLRenderTarget(res, res, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      depthBuffer: true,
      stencilBuffer: false,
    });

    this.portalRT2 = new THREE.WebGLRenderTarget(res, res, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      depthBuffer: true,
      stencilBuffer: false,
    });

     //***NEW***
    this._mFlip = new THREE.Matrix4().makeRotationY(Math.PI);
    this._mSrcInv = new THREE.Matrix4();
    this.portalRT.texture.colorSpace = THREE.SRGBColorSpace;
    this.portalRT2.texture.colorSpace = THREE.SRGBColorSpace;

    this.reticle = null;
    this.hitTestSourceRequested = false;
    this.hitTestSource = null;
    this.ui = createUI();


    window.addEventListener("resize", () => this.onResize());
  }

  async init() {
    await this.setupPortalScene();

    await this.setupVRScene();
    // HitTest und Portal-Controller für AR + text UI
    this.arPortal = new ARPortalController({
      renderer: this.renderer,
      portalScene: this.portalScene,
      portal: this.portal,
      ui: this.ui,
    });
    this.reticle = this.arPortal.setupReticle();

    this.setupPlayer();
    this.setupControls();
    this.setupPortalDetection();
    //this.setupReticle();
    this.story = new StoryManager({
      ui: this.ui,
      vrGroup: this.vrGroup,
      vrScene: this.vrScene,
      player: this.player,
      mainCamera: this.mainCamera,
      listener: this.listener,
    });
    this.start();
  }

  async setupPortalScene() {

    this.portal = createPortal({
      portalConfig: CONFIG.portal,
      portalPosition: new THREE.Vector3(0, 3.0, -3),
      portalRT: this.portalRT,
      color: 0x00ffff
    });

    this.portalScene.add(this.portal.mesh);
    this.portalScene.add(this.portal.ring);

    this.portalScene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const spotlight = new THREE.SpotLight(0x00ffff, 2);
    spotlight.position.set(0, 5, 0);
    spotlight.target.position.set(0, 3.5, -3);

    this.portalScene.add(spotlight);
    this.portalScene.add(spotlight.target);

    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 })
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.userData.excludeFromAR = true;
    this.portalScene.add(this.ground);

    //this.portalScene.add(getStarfield({ numStars: 5000 }));

  }

  async setupVRScene() {
    // Skybox für VR-Welt
    this.vrScene.background = null;
    /* const skytexture = await new THREE.TextureLoader().loadAsync("/Skyboxes/forest_slope_4k.png");
    skytexture.colorSpace = THREE.SRGBColorSpace;
    skytexture.mapping = THREE.EquirectangularReflectionMapping; */

    const vrGroup = await initVRGroup();
    this.vrGroup = vrGroup;
    vrGroup.position.set(0, 0, 0);
    this.vrScene.add(vrGroup);

    this.vrScene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1.0));

    this.portal2 = createPortal({
      portalConfig: CONFIG.portal,
      portalPosition: new THREE.Vector3(0, 3, 2),
      portalRT: this.portalRT2,
      color: 0xff00ff,
      isPassthrough: true
    });

    this.vrScene.add(this.portal2.mesh);
    this.vrScene.add(this.portal2.ring);
    this.portal2 = {
      mesh: this.portal2.mesh,
      ring: this.portal2.ring
    };
    console.log("✅ Portal 2 in VR-Szene erstellt bei:", this.portal2.mesh.position);

    // Partikelsystem erstellen 
    // TODO: PARAMETER MÜSSEN NOCH ANGEPASST WERDEN
    const fireA = getParticleSystem({
      camera: this.mainCamera,
      emitter: vrGroup.userData.fireEmitter1,
      parent: vrGroup,
      rate: 150.0,
      texture: '/textures/fire.png',
      maxParticles: 2000,
      radius: 1.0
    });

    const fireB = getParticleSystem({
      camera: this.mainCamera,
      emitter: vrGroup.userData.fireEmitter2,
      parent: this.vrGroup,
      texture: "/textures/fire.png",
      rate: 60,
      radius: 0.25,
      maxSize: 8,
      maxLife: 1.4,
      baseVelocity: new THREE.Vector3(0, 2.2, 0),
    });

    const fireC = getParticleSystem({
      camera: this.mainCamera,
      emitter: vrGroup.userData.fireEmitter3,
      parent: this.vrGroup,
      texture: "/textures/fire.png",
      rate: 180,
      radius: 1.0,
      maxSize: 18,
      maxLife: 2.6,
      baseVelocity: new THREE.Vector3(0, 4.0, 0),
      velocityJitter: new THREE.Vector3(0.6, 1.5, 0.6),
      colorPoints: [[0.0, 0xfff2cc], [0.4, 0xff6600], [1.0, 0xaa0000]],
    });

    fireA.stop({ clear: true }); // nicht sofort laufen lassen
    fireB.stop({ clear: true });
    fireC.stop({ clear: true });
    vrGroup.userData.fireA = fireA;
    vrGroup.userData.fireB = fireB;
    vrGroup.userData.fireC = fireC;

  }

  addPortalToVRMode() {
     if (this._vrDecorAdded) return;
    this._vrDecorAdded = true;

    //const { leftWall, rightWall, topWall } = createPortalFrame();
    //this.portalScene.add(leftWall, rightWall, topWall);
  }

  start() {
    let t = 0;
    const clock = new THREE.Clock();

    this.renderer.setAnimationLoop((t, frame) => {
      if (!frame) return;
      //const isXRFrame = !!frame;
      t += 0.01;
      const dt = clock.getDelta();

      const gl = this.renderer.getContext();
      if (gl.drawingBufferWidth === 0 || gl.drawingBufferHeight === 0) {
        return; // XR/canvas ist gerade 0x0 -> Frame skip
      }


      // ✅ KEYBOARD BEWEGUNG
      this.player.position.x += this.velocity.x;
      this.player.position.z += this.velocity.z;

      const referenceSpace = this.renderer.xr.getReferenceSpace();
      const session = this.renderer.xr.getSession();
      const isAR =
        this.renderer.xr.isPresenting &&
        session?.environmentBlendMode === "alpha-blend";

      const isVR = this.renderer.xr.isPresenting &&
        session?.environmentBlendMode === "opaque";

      //setzt spieler offset wenn in AR session UND vrScene
      if (isAR && this.currentScene === this.vrScene) {
        this.player.position.y = 1.6;   // oder 1.7
      } else if (isAR) {
        this.player.position.y = 0.0;   // draußen in AR wieder "neutral"
      }

      this.arPortal.hitTestProcess(frame, referenceSpace, session);

      if (this.ground) {
        this.ground.visible = !isAR;
      }
      ThreeMeshUI.update();


      // VR CONTROLLER BEWEGUNG
      this.vrMove?.update();

      this.portalTransition?.update();

      if (isVR && !this._vrAdded) {
        this.addPortalToVRMode();
        this._vrAdded = true;
      }
      if (!isVR) this._vrAdded = false;

      // Portal-Transition MUSS pro Frame laufen
      if (isVR) {
        this.portalTransition?.update();
      }


      if (this._lastScene !== this.currentScene) {
        this.isInVRWorld = (this.currentScene === this.vrScene);

        if (this.isInVRWorld) this.story.start("vr_intro");
        else this.story.stop();

        this._lastScene = this.currentScene;
      }

      //Update Partikelsystem nur, wenn in VR Welt
      if (this.isInVRWorld) {
        this.vrGroup?.userData?.fireA?.update?.(dt);
        this.vrGroup?.userData?.fireB?.update?.(dt);
        this.vrGroup?.userData?.fireC?.update?.(dt);
      }

      if (!this.isInVRWorld) stopAllFires(this.vrGroup);

      //Danach Story pro Frame fortschreiben
      this.story.update(dt);
      
            // --- RenderTargets (Portale) ---
      this.renderer.xr.enabled = false;
      const oldTarget = this.renderer.getRenderTarget();

      // Portal 1 (in portalScene) zeigt vrScene
      this.updatePortalCameraFromPortals(this.portal.mesh, this.portal2.mesh);

      // Portal2 kurz verstecken, damit keine Rekursion entsteht
      this.portal2.mesh.visible = false;
      this.portal2.ring.visible = false;

      this.renderer.setRenderTarget(this.portalRT);
      this.renderer.clear(true, true, true);
      this.renderer.render(this.vrScene, this.portalCamera);

      this.portal2.mesh.visible = true;
      this.portal2.ring.visible = true;


      // Portal 2 (in vrScene) zeigt portalScene
      this.updatePortalCameraFromPortals(this.portal2.mesh, this.portal.mesh);

      // Portal1 verstecken (auch hier Rekursion vermeiden)
      this.portal.mesh.visible = false;
      this.portal.ring.visible = false;

      this.renderer.setRenderTarget(this.portalRT2);
      this.renderer.clear(true, true, true);
      this.renderer.render(this.portalScene, this.portalCamera);

      this.portal.mesh.visible = true;
      this.portal.ring.visible = true;


      // Restore
      this.renderer.setRenderTarget(oldTarget);
      this.renderer.xr.enabled = true;

      this.renderer.clear(!isAR, true, true);
      this.renderer.render(this.currentScene, this.mainCamera);

    });
  }

  onResize() {
    // in XR nicht setzen
    if (this.renderer.xr.isPresenting) return;

    this.mainCamera.aspect = window.innerWidth / window.innerHeight;
    this.mainCamera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setupPlayer() {
    this.player = new THREE.Group();
    this.player.add(this.mainCamera);

    this.listener = new THREE.AudioListener();
    this.mainCamera.add(this.listener);


    // Starte in der Portal-Szene (vor dem Portal)
    this.currentScene = this.portalScene;
    this.currentScene.add(this.player)
    this.lastPlayerZ = this.player.position.z;
  }

  setupControls() {
    this.vrMove = new VRMovementController({
      renderer: this.renderer,
      camera: this.mainCamera,
      player: this.player,
      speed: CONFIG.player.speed,
      deadzone: CONFIG.player.deadzone,
    });

    setupVRControllers(this.renderer, this.player, this.arPortal.onSelect.bind(this));
    this.velocity = new THREE.Vector3();

    setupWSADControls(this.velocity);
  }

  setupPortalDetection() {
    this.portalTransition = new PortalTransitionManager({
        player: this.player,
        portalScene: this.portalScene,
        vrScene: this.vrScene,
        getCurrentScene: () => this.currentScene,
        setCurrentScene: (s) => (this.currentScene = s),
        radius: CONFIG.portal.radius,
        portal1: this.portal,
        portal2: this.portal2
    });

    this.portal.triggerZ = -0.5; // Relativ zum Portal-Mesh
    this.portal.teleportZ = -3;
    this.portal2.triggerZ = 0.5;
    this.portal2.teleportZ = 2;
  }

  updatePortalCameraFromPortals(srcPortalMesh, dstPortalMesh) {
  // XR: ArrayCamera, Desktop: mainCamera
  const xrCam = this.renderer.xr.isPresenting
    ? this.renderer.xr.getCamera(this.mainCamera)
    : this.mainCamera;

  // Für mono-Portal nehmen wir ein Auge (0)
  const viewerCam = (xrCam && xrCam.isArrayCamera) ? xrCam.cameras[0] : xrCam;

  viewerCam.updateMatrixWorld(true);
  srcPortalMesh.updateMatrixWorld(true);
  dstPortalMesh.updateMatrixWorld(true);

  // dst * flip * inv(src) * viewer
  this._mSrcInv.copy(srcPortalMesh.matrixWorld).invert();

  this.portalCamera.matrixWorld
    .copy(dstPortalMesh.matrixWorld)
    .multiply(this._mFlip)
    .multiply(this._mSrcInv)
    .multiply(viewerCam.matrixWorld);

  this.portalCamera.matrixWorld.decompose(
    this.portalCamera.position,
    this.portalCamera.quaternion,
    this.portalCamera.scale
  );

  // Projection vom Viewer übernehmen (wichtig für FOV/“fühlt sich echt an”)
  this.portalCamera.projectionMatrix.copy(viewerCam.projectionMatrix);
  this.portalCamera.projectionMatrixInverse.copy(viewerCam.projectionMatrixInverse);

  this.portalCamera.updateMatrixWorld(true);
}


}
const app = new PortalSystem();
app.init();


function stopAllFires(vrGroup) {
  const ud = vrGroup?.userData;
  if (!ud) return;
  for (const k of ["fireA", "fireB", "fireC"]) {
    ud[k]?.stop?.({ clear: true });
  }
}