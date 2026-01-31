import * as THREE from "three";

export class PortalTransitionManager {
    constructor({
        player,
        getCurrentScene,
        setCurrentScene,
        portalScene,
        vrScene,
        portal1,
        portal2,
        radius,
        arController,
        cooldownFrames = 120,
    }) {
        this.player = player;

        this.arController = arController;
        this.getCurrentScene = getCurrentScene;
        this.setCurrentScene = setCurrentScene;

        this.portalScene = portalScene;
        this.vrScene = vrScene;

        // portal1/portal2: { position: {x,y,z}, enterZCondition, exitZCondition } oder simpel position
        this.portal1 = portal1;
        this.portal2 = portal2;

        this.radius = radius;

        this.cooldownFrames = cooldownFrames;
        this.cooldown = 0;

        this.isInVRWorld = false;
        this._tempPortalPos = new THREE.Vector3();
        this.audioBuffers = {}; // Speicher für vorgeladene Sounds
        this.listener = new THREE.AudioListener();
        this.player.add(this.listener);
        
        // Sounds direkt beim Start laden
        this.preloadAudio("/audio/whoosh-flanging.mp3", "enter");
        this.preloadAudio("/audio/whoosh-motion.mp3", "exit");
    }

    update() {
        if (this.cooldown > 0) {
            this.cooldown--;
            return;
        }

        const p = this.player.position;

        if (!this.isInVRWorld) {
            // Eintritt Portal 1
            if (!this.portal1?.mesh || !this.portal1.isPlaced) return;

            this.portal1.mesh.getWorldPosition(this._tempPortalPos);
            
            const withinXY =
                Math.abs(p.x - this._tempPortalPos.x) < this.radius &&
                Math.abs(p.y - this._tempPortalPos.y) < this.radius * 1.5;

            // BERECHNUNG: Wie weit ist der Spieler vom Portal auf der Z-Achse entfernt?
            const distZ = p.z - this._tempPortalPos.z;

            if (withinXY && distZ < 0 && distZ > -0.5) {
                this.enterVRWorld();
            }
        } else {
            // Exit Portal 2
            if (!this.portal2.mesh) return;
            this.portal2.mesh.getWorldPosition(this._tempPortalPos);

            const withinXY =
                Math.abs(p.x - this._tempPortalPos.x) < this.radius &&
                Math.abs(p.y - this._tempPortalPos.y) < this.radius * 1.5;

            const distZ = p.z - this._tempPortalPos.z;

            if (withinXY && distZ > 0 && distZ < 0.5) {
                this.exitVRWorld();
            }
        }
    }

    enterVRWorld() {
        console.log("🌀 Portal betreten → VR-Welt!");
        this.playAudio("enter");
        this.isInVRWorld = true;
        this.cooldown = this.cooldownFrames;

        const current = this.getCurrentScene();
        current.remove(this.player);

        this.setCurrentScene(this.vrScene);
        this.vrScene.add(this.player);

        this.player.position.set(this.player.position.x, this.player.position.y, this.portal1.teleportZ);
        if (this.arController.ui) this.arController.ui.visible = false;
    }

    exitVRWorld() {
        console.log("🚪 Portal verlassen → Portal-Szene!");
        this.playAudio("exit");
        this.isInVRWorld = false;
        this.cooldown = this.cooldownFrames;

        const current = this.getCurrentScene();
        current.remove(this.player);

        this.setCurrentScene(this.portalScene);
        this.portalScene.add(this.player);

        this.player.position.set(this.player.position.x, this.player.position.y, this.portal2.teleportZ);

        const forward = new THREE.Vector3();
        this.player.getWorldDirection(forward);

        //zwei Meter hinter dem Player
        const backOffset = forward.clone().multiplyScalar(-2.0);
        const newPortalPos = this.player.position.clone().add(backOffset);

        if (this.portal1?.mesh) {
            this.portal1.mesh.position.copy(newPortalPos);
            this.portal1.ring.position.copy(newPortalPos);
            
            // Portal zum Spieler ausrichten (damit man die Vorderseite sieht)
            this.portal1.mesh.lookAt(this.player.position.x, 1.5, this.player.position.z);
            this.portal1.ring.quaternion.copy(this.portal1.mesh.quaternion);
            
            this.portal1.mesh.updateMatrixWorld(true);
        }

        if (this.arController) {
            this.arController.resetHitTest();
            // UI wieder einschalten, damit man weiß, dass man neu platzieren kann
            if (this.arController.ui) this.arController.ui.visible = true;
        }

    }

    async playAudio(key){
        const buffer = this.audioBuffers[key];
        if (buffer) {
            const sound = new THREE.Audio(this.listener);
            sound.setBuffer(buffer);
            sound.setVolume(0.5);
            sound.play();
        }
    }

    async preloadAudio(url, key) {
    const loader = new THREE.AudioLoader();
    try {
        const buffer = await loader.loadAsync(url);
        this.audioBuffers[key] = buffer;
    } catch (e) {
        console.error("Audio konnte nicht geladen werden:", url);
    }
}
}
