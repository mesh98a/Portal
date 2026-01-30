// portal.js
import * as THREE from "three";

export function createPortal({ portalConfig, portalPosition, portalRT, color, isPassthrough = false }) {
  const { radius } = portalConfig;

  const portalGeo = new THREE.CircleGeometry(radius, 64);
  
  let portalMat;
  
  if (isPassthrough) {
    // --- PASSTHROUGH LOGIK ---
    //material ist "durchsichtig" --> Loch/Stencil in der VR-Welt in der reale Welt
    portalMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      blending: THREE.NoBlending,
    });
  } else {
    // Standard Portal-Logik (zeigt die andere Szene)
    portalMat = new THREE.MeshBasicMaterial({
      map: portalRT.texture,
      side: THREE.DoubleSide,
    });
  }

  const portalMesh = new THREE.Mesh(portalGeo, portalMat);
  if (isPassthrough) portalMesh.renderOrder = -1;

  portalMesh.position.copy(portalPosition);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius, radius + 0.08, 64),
    new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    })
  );
  ring.position.copy(portalMesh.position);

  return { mesh: portalMesh, ring: ring };
}


export function createPortalFrame() {
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: "blue",
    roughness: 0.7
  });

  // Linke Wand
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(1, 8, 0.5),
    wallMaterial
  );
  leftWall.position.set(-3.5, 4, -3);

  // Rechte Wand
  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(1, 8, 0.5),
    wallMaterial
  );
  rightWall.position.set(3.5, 4, -3);

  // Obere Wand
  const topWall = new THREE.Mesh(
    new THREE.BoxGeometry(6, 1, 0.5),
    wallMaterial
  );
  topWall.position.set(0, 7.5, -3);
  return { leftWall, rightWall, topWall };
}
