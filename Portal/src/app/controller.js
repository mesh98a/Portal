 import * as THREE from "three";

 export function setupVRControllers(renderer, player, onSelect) {
    const controller1 = renderer.xr.getController(0);
    const controller2 = renderer.xr.getController(1);

    controller1.addEventListener("select", onSelect.bind(this));



    const controllerGrip1 = renderer.xr.getControllerGrip(0);
    const controllerGrip2 = renderer.xr.getControllerGrip(1);

    const gripGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.15);
    const gripMaterial1 = new THREE.MeshStandardMaterial({ color: "red" });
    const gripMaterial2 = new THREE.MeshStandardMaterial({ color: "blue" });

    controllerGrip1.add(new THREE.Mesh(gripGeometry, gripMaterial1));
    controllerGrip2.add(new THREE.Mesh(gripGeometry, gripMaterial2));

    player.add(controller1);
    player.add(controller2);
    player.add(controllerGrip1);
    player.add(controllerGrip2);

  }

  // Tastatur-Steuerung
  export function setupWSADControls(velocity) {

    window.addEventListener("keydown", (e) => {
      const speed = 0.1;
      if (e.code === "KeyW") velocity.z = -speed;
      if (e.code === "KeyS") velocity.z = speed;
      if (e.code === "KeyA") velocity.x = -speed;
      if (e.code === "KeyD") velocity.x = speed;
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "KeyW" || e.code === "KeyS") velocity.z = 0;
      if (e.code === "KeyA" || e.code === "KeyD") velocity.x = 0;
    });
  }