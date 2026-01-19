// portal.js
import * as THREE from "three";

export  function createPortal({ portalConfig, portalPosition, portalRT,color}) {

  const { position, radius } = portalConfig

  const portalGeo = new THREE.CircleGeometry(radius, 64);
  const portalMat = new THREE.MeshBasicMaterial({
    map: portalRT.texture,
    side: THREE.DoubleSide,
  });

  const portalMesh = new THREE.Mesh(portalGeo, portalMat);
  portalMesh.position.copy(portalPosition);

  // Portal-Ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius, radius + 0.08, 64),
    new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    })
  );

  ring.position.copy(portalMesh.position);

  // Speichern
  const portal = {
    mesh: portalMesh,
    ring: ring
  };

  return portal;
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
