import * as THREE from "three";

export class VRMovementController {
  constructor({ renderer, camera, player, speed = 0.05, deadzone = 0.1 }) {
    this.renderer = renderer;
    this.camera = camera;
    this.player = player;
    this.speed = speed;
    this.deadzone = deadzone;

    this._dir = new THREE.Vector3();
    this._right = new THREE.Vector3();
    this._up = new THREE.Vector3(0, 1, 0);
  }

  update() {
    const session = this.renderer.xr.getSession();
    if (!session) return;

    for (const source of session.inputSources) {
      const gp = source.gamepad;
      if (!gp) continue;

      const { xAxis, yAxis } = this.getThumbstickAxes(gp);
      if (!this.isMovementDetected(xAxis, yAxis)) continue;

      this.movePlayer(xAxis, yAxis);
    }
  }

  getThumbstickAxes(gamepad) {
    const axes = gamepad.axes;

    const xAlt = axes[2];
    const yAlt = axes[3];

    const xAxis = (xAlt !== undefined && Math.abs(xAlt) > this.deadzone) ? xAlt : (axes[0] ?? 0);
    const yAxis = (yAlt !== undefined && Math.abs(yAlt) > this.deadzone) ? yAlt : (axes[1] ?? 0);

    return { xAxis, yAxis };
  }

  isMovementDetected(xAxis, yAxis) {
    return Math.abs(xAxis) > this.deadzone || Math.abs(yAxis) > this.deadzone;
  }

  movePlayer(xAxis, yAxis) {
    this.camera.getWorldDirection(this._dir);
    this._dir.y = 0;
    this._dir.normalize();

    this._right.crossVectors(this._dir, this._up);

    this.player.position.addScaledVector(this._dir, -yAxis * this.speed);
    this.player.position.addScaledVector(this._right, xAxis * this.speed);
  }
}
