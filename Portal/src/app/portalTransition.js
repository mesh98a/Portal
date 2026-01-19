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
        cooldownFrames = 120,
    }) {
        this.player = player;

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
    }

    update() {
        if (this.cooldown > 0) {
            this.cooldown--;
            return;
        }

        const p = this.player.position;

        if (!this.isInVRWorld) {
            // Eintritt Portal 1
            const pos = this.portal1.position;
            const withinXY =
                Math.abs(p.x - pos.x) < this.radius &&
                Math.abs(p.y - pos.y) < this.radius * 1.5;

            if (withinXY && p.z < this.portal1.triggerZ) {
                this.enterVRWorld();
            }
        } else {
            // Exit Portal 2
            const pos = this.portal2.position;
            const withinXY =
                Math.abs(p.x - pos.x) < this.radius &&
                Math.abs(p.y - pos.y) < this.radius * 1.5;

            if (withinXY && p.z > this.portal2.triggerZ) {
                this.exitVRWorld();
            }
        }
    }

    enterVRWorld() {
        console.log("🌀 Portal betreten → VR-Welt!");
        this.isInVRWorld = true;
        this.cooldown = this.cooldownFrames;

        const current = this.getCurrentScene();
        current.remove(this.player);

        this.setCurrentScene(this.vrScene);
        this.vrScene.add(this.player);

        this.player.position.set(this.player.position.x, this.player.position.y, this.portal1.teleportZ);
    }

    exitVRWorld() {
        console.log("🚪 Portal verlassen → Portal-Szene!");
        this.isInVRWorld = false;
        this.cooldown = this.cooldownFrames;

        const current = this.getCurrentScene();
        current.remove(this.player);

        this.setCurrentScene(this.portalScene);
        this.portalScene.add(this.player);

        this.player.position.set(this.player.position.x, this.player.position.y, this.portal2.teleportZ);
    }
}
