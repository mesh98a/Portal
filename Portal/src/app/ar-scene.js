// ARPortalController.js
import * as THREE from "three";

export class ARPortalController {
    constructor({ renderer, portalScene, portal, ui }) {
        this.renderer = renderer;
        this.portalScene = portalScene;
        this.portal = portal;
        this.ui = ui;

        this.reticle = null;

        this.hitTestSourceRequested = false;
        this.hitTestSource = null;

        this.activePortal = null;
        this.isPlaced = false;
    }

    setupReticle() {
        this.reticle = new THREE.Mesh(
            new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial()
        );

        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;

        if (this.ui) this.reticle.add(this.ui);
        this.portalScene.add(this.reticle);

        return this.reticle;
    }

    onSelect() {
        if (!this.reticle?.visible) return;

        // altes Portal entfernen
        if (this.activePortal) {
            this.portalScene.remove(this.activePortal.mesh, this.activePortal.ring);
            this.activePortal = null;
        }

        console.log("➕ Neues Portal erstellen");

        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        this.reticle.matrix.decompose(pos, quat, scale);

        // Portal dort platzieren, wo die Reticle ist
        const offset = new THREE.Vector3(0, 0, -2);
        const p = pos.clone().add(offset);

        this.portal.mesh.position.copy(p);
        this.portal.ring.position.copy(p);

        /* this.portal.mesh.position.copy(pos);
        this.portal.ring.position.copy(pos); */

        this.portal.mesh.updateMatrixWorld(true);
        this.portal.isPlaced = true;

        const e = new THREE.Euler().setFromQuaternion(quat, "YXZ");
        e.x = 0;
        e.z = 0;

        this.portal.mesh.quaternion.setFromEuler(e);
        this.portal.ring.quaternion.copy(this.portal.mesh.quaternion);

        this.portalScene.add(this.portal.mesh, this.portal.ring);

        this.activePortal = { mesh: this.portal.mesh, ring: this.portal.ring };
    }

    hitTestProcess(frame, referenceSpace, session) {
        // Vereinfachte Prüfung: Wenn wir ein Frame und eine Session haben, sind wir bereit
        if (!this.reticle || !frame || !session) return;

        if (!this.hitTestSourceRequested) {
            session.requestReferenceSpace("viewer").then((viewerSpace) => {
                session.requestHitTestSource({ space: viewerSpace }).then((source) => {
                    this.hitTestSource = source;
                });
            });

            session.addEventListener("end", () => {
                this.hitTestSourceRequested = false;
                this.hitTestSource = null;
                this.reticle.visible = false; // Reticle beim Beenden ausblenden
            });

            this.hitTestSourceRequested = true;
        }

        if (this.hitTestSource) {
            const hitTestResults = frame.getHitTestResults(this.hitTestSource);
            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(referenceSpace);

                if (pose) {
                    this.reticle.visible = true;
                    this.reticle.matrix.fromArray(pose.transform.matrix);
                }
            } else {
                this.reticle.visible = false;
            }
        }
    }
}
