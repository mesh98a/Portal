import * as THREE from 'three';
import { createARButton } from './xr-buttons.js';
import { addMagicPortal } from './scene-content.js';
import { addHole } from './scene-content.js';
import { addPortalParticles } from './scene-content.js';

export function initARScene(scene, camera, renderer) {
    createARButton(renderer);

    const portal = addMagicPortal(0.98, 1.0);
    const hole = addHole(0.98);
    portal.position.set(0, 0, -2);
    hole.position.set(0, 0, -2);
    scene.add(hole);
    scene.add(portal);

    const particles = addPortalParticles(0.98);
    particles.position.copy(portal.position);
    scene.add(particles);

    let t = 0;
    renderer.setAnimationLoop(() => {
        t += 0.05;
        portal.material.opacity = 0.6 + Math.sin(t) * 0.4;
        portal.material.uniforms.time.value = t;
        //portal.rotation.z += 0.1;
        particles.rotation.z += 0.0051;
        renderer.render(scene, camera);
    });
}





