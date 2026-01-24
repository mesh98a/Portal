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


const CONFIG = {
  player: {
    speed: 0.05,
    deadzone: 0.1
  }, portal: {
    size: { width: 6, height: 7 },
    position: { x: 0, y: 3.0, z: -3 },
    radius: 2.5,
    zoom: 1.5,
    resolution: 256
  }
};

class PortalSystem {
  constructor() {
    const { width, height, position, radius, zoom, resolution } = CONFIG.portal;
    const res = Math.max(1, CONFIG.portal.resolution || 256);

    // Renderer + Szenen
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    document.body.appendChild(this.renderer.domElement);
    const vrbtn = createVRButton(this.renderer);
    const arbtn = createARButton(this.renderer);



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


    const portal = createPortal({
      portalConfig: CONFIG.portal,
      portalPosition: new THREE.Vector3(0, 3.0, -3),
      portalRT: this.portalRT,
      color: 0x00ffff
    });

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

    this.portal = {
      mesh: portal.mesh,
      ring: portal.ring,
    };
    this.portalScene.add(getStarfield({ numStars: 5000 }));

  }

  async setupVRScene() {
    // Skybox für VR-Welt
    const skytexture = await new THREE.TextureLoader().loadAsync("/Skyboxes/forest_slope_4k.png");
    skytexture.colorSpace = THREE.SRGBColorSpace;
    skytexture.mapping = THREE.EquirectangularReflectionMapping;
    this.vrScene.background = skytexture;

    const vrGroup = await initVRGroup();
    this.vrGroup = vrGroup;
    vrGroup.position.set(0, 0, 0);
    this.vrScene.add(vrGroup);

    this.vrScene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1.0));

    this.portal2 = createPortal({
      portalConfig: CONFIG.portal,
      portalPosition: new THREE.Vector3(0, 3, 2),
      portalRT: this.portalRT2,
      color: 0xff00ff
    });

    this.vrScene.add(this.portal2.mesh);
    this.vrScene.add(this.portal2.ring);
    this.portal2 = {
      mesh: this.portal2.mesh,
      ring: this.portal2.ring
    };
    console.log("✅ Portal 2 in VR-Szene erstellt bei:", this.portal2.mesh.position);

  }

  updatePortalCamera() {
    if (this.isInVRWorld) {
      // Zeige Portal-Szene im Portal 2
      this.portalCamera.position.set(-2, 3, 5);
      this.portalCamera.lookAt(-1, 1.6, -3); // Schaue in Portal-Szene
    } else {
      // Zeige VR-Szene im Portal 1
      this.portalCamera.position.set(3, 2, 6);
      this.portalCamera.lookAt(1, 1, 0); // Schaue in VR-Szene
    }
  }

  addPortalToVRMode() {
    this.portalScene.add(this.portal.mesh, this.portal.ring);
    this.vrScene.add(this.portal2.mesh, this.portal2.ring);
    const { leftWall, rightWall, topWall } = createPortalFrame();
    this.portalScene.add(leftWall);
    this.portalScene.add(rightWall);
    this.portalScene.add(topWall);
  }

  start() {
    let t = 0;
    const clock = new THREE.Clock();

    this.renderer.setAnimationLoop((time, frame) => {
      if (!frame) return;
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

      this.arPortal.hitTestProcess(frame, referenceSpace, session);

      if (this.ground) {
        this.ground.visible = !isAR;
      }
      ThreeMeshUI.update();


      // VR CONTROLLER BEWEGUNG
      this.vrMove?.update();

      this.updatePortalCamera();
      if (isVR) {
        this.addPortalToVRMode();
        if (isVR) this.portalTransition?.update();

      }

      if (this._lastScene !== this.currentScene) {
        this.isInVRWorld = (this.currentScene === this.vrScene);

        if (this.isInVRWorld) this.story.start("vr_intro");
        else this.story.stop();

        this._lastScene = this.currentScene;
      }

      // 3) Danach Story pro Frame fortschreiben
      this.story.update(dt);
      
      this.renderer.xr.enabled = false;
      const oldTarget = this.renderer.getRenderTarget();

      this.portal2.mesh.visible = false; // Portal 2 verstecken
      this.portal2.ring.visible = false;

      this.renderer.setRenderTarget(this.portalRT);
      this.renderer.clear(true, true, true);
      this.renderer.render(this.vrScene, this.portalCamera);


      this.portal2.mesh.visible = true;
      this.portal2.ring.visible = true;

      this.portal.mesh.visible = false;
      this.portal.ring.visible = false;

      // ✅ Portal 2: Zeigt Portal-Szene (Rückblick)
      this.renderer.setRenderTarget(this.portalRT2);
      this.renderer.clear(true, true, true);
      this.renderer.render(this.portalScene, this.portalCamera);

      this.portal.mesh.visible = true;
      this.portal.ring.visible = true;

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
    this.portalScene.add(this.player);
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
      cooldownFrames: 120,

      portal1: {
        position: CONFIG.portal.position,
        triggerZ: -2.5,
        teleportZ: -5,
      },
      portal2: {
        position: { x: 0, y: 2, z: 2 },
        triggerZ: 2.5,
        teleportZ: 2,
      },
    });
  }
}
const app = new PortalSystem();
app.init();
