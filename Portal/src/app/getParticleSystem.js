import * as THREE from 'three';

// Quelle: https://github.com/bobbyroe/Simple-Particle-Effects/blob/main/index.js

const _VS = `
uniform float pointMultiplier;

attribute float size;
attribute float angle;
attribute vec4 aColor;

varying vec4 vColor;
varying vec2 vAngle;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;

  vAngle = vec2(cos(angle), sin(angle));
  vColor = aColor;
}`;

const _FS = `
uniform sampler2D diffuseTexture;

varying vec4 vColor;
varying vec2 vAngle;

void main() {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColor;
}`;

function getLinearSpline(lerp) {
  const points = [];
  const _lerp = lerp;

  function addPoint(t, d) {
    points.push([t, d]);
    points.sort((a, b) => a[0] - b[0]);
  }

  function setPoints(arr) {
    points.length = 0;
    for (const [t, d] of arr) addPoint(t, d);
  }

  function getValueAt(t) {
    let p1 = 0;
    for (let i = 0; i < points.length; i++) {
      if (points[i][0] >= t) break;
      p1 = i;
    }
    const p2 = Math.min(points.length - 1, p1 + 1);
    if (p1 === p2) return points[p1][1];

    return _lerp(
      (t - points[p1][0]) / (points[p2][0] - points[p1][0]),
      points[p1][1],
      points[p2][1]
    );
  }

  return { addPoint, setPoints, getValueAt };
}

function computePointMultiplier(camera) {
  const fov = THREE.MathUtils.degToRad(camera.fov);
  return window.innerHeight / (2.0 * Math.tan(fov / 2.0));
}

function getParticleSystem(params) {
  const {
    camera,
    emitter,
    parent,
    texture,

    // Instanz-Optionen (Defaults bleiben nah an deinem Code)
    rate = 80,
    maxParticles = 2000,

    radius = 0.5,                 // einfacher Spawn: Würfel um Emitter
    maxLife = 2.5,
    maxSize = 5.0,

    baseVelocity = new THREE.Vector3(0, 3.5, 0),
    velocityJitter = new THREE.Vector3(0.0, 0.0, 0.0), // optional

    dragCoeff = 0.1,              // dein dt*0.1

    // Kurven optional überschreibbar
    alphaPoints = [[0.0, 0.0], [0.6, 1.0], [1.0, 0.0]],
    colorPoints = [[0.0, 0xFFFFFF], [1.0, 0xff8080]],
    sizePoints  = [[0.0, 0.0], [1.0, 1.0]],

    intensity = 1.0,              // skaliert Rate (0..1)
  } = params;

  const tex = new THREE.TextureLoader().load(texture);

  const uniforms = {
    diffuseTexture: { value: tex },
    pointMultiplier: { value: computePointMultiplier(camera) },
  };

  const _material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: _VS,
    fragmentShader: _FS,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
    transparent: true,
    vertexColors: true,
  });

  let _particles = [];
  let _carry = 0.0;
  let _running = false;

  // Runtime-config (pro Instanz änderbar via setOptions)
  const cfg = {
    rate,
    maxParticles,
    radius,
    maxLife,
    maxSize,
    baseVelocity: baseVelocity.clone(),
    velocityJitter: velocityJitter.clone(),
    dragCoeff,
    intensity: THREE.MathUtils.clamp(intensity, 0, 1),
  };

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
  geometry.setAttribute('aColor', new THREE.Float32BufferAttribute([], 4));
  geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));

  const _points = new THREE.Points(geometry, _material);
  parent.add(_points);
  _points.frustumCulled = false; // wichtig für dynamische Points-Geometrie

  const alphaSpline = getLinearSpline((t, a, b) => a + t * (b - a));
  const colorSpline = getLinearSpline((t, a, b) => a.clone().lerp(b, t));
  const sizeSpline  = getLinearSpline((t, a, b) => a + t * (b - a));

  // initiale Kurven
  alphaSpline.setPoints(alphaPoints);
  sizeSpline.setPoints(sizePoints);
  colorSpline.setPoints(colorPoints.map(([t, hex]) => [t, new THREE.Color(hex)]));

  const _emitterWorld = new THREE.Vector3();

  function _AddParticles(dt) {
    if (!_running) return;

    const effectiveRate = cfg.rate * cfg.intensity;

    _carry += dt;
    const n = Math.floor(_carry * effectiveRate);
    if (effectiveRate > 0) _carry -= n / effectiveRate;

    emitter.getWorldPosition(_emitterWorld);

    for (let i = 0; i < n; i++) {
      if (_particles.length >= cfg.maxParticles) break;

      const life = (Math.random() * 0.75 + 0.25) * cfg.maxLife;

      _particles.push({
        position: new THREE.Vector3(
          (Math.random() * 2 - 1) * cfg.radius,
          (Math.random() * 2 - 1) * cfg.radius,
          (Math.random() * 2 - 1) * cfg.radius,
        ).add(_emitterWorld),

        size: (Math.random() * 0.5 + 0.5) * cfg.maxSize,
        colour: new THREE.Color(),
        alpha: 1.0,

        life,
        maxLife: life,

        rotation: Math.random() * 2.0 * Math.PI,
        rotationRate: Math.random() * 0.01 - 0.005,

        velocity: new THREE.Vector3(
          cfg.baseVelocity.x + (Math.random() * 2 - 1) * cfg.velocityJitter.x,
          cfg.baseVelocity.y + (Math.random() * 2 - 1) * cfg.velocityJitter.y,
          cfg.baseVelocity.z + (Math.random() * 2 - 1) * cfg.velocityJitter.z,
        ),
        currentSize: 0.0,
      });
    }
  }

  function _UpdateParticles(dt) {
    for (const p of _particles) p.life -= dt;
    _particles = _particles.filter(p => p.life > 0.0);

    for (const p of _particles) {
      const t = 1.0 - p.life / p.maxLife;

      p.rotation += p.rotationRate;
      p.alpha = alphaSpline.getValueAt(t);
      p.currentSize = p.size * sizeSpline.getValueAt(t);
      p.colour.copy(colorSpline.getValueAt(t));

      p.position.addScaledVector(p.velocity, dt);

      // drag (wie bei dir, nur coeff parametrierbar)
      const drag = p.velocity.clone().multiplyScalar(dt * cfg.dragCoeff);
      drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
      drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
      drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
      p.velocity.sub(drag);
    }
  }

  function _UpdateGeometry() {
    const positions = [];
    const sizes = [];
    const colours = [];
    const angles = [];

    for (const p of _particles) {
      positions.push(p.position.x, p.position.y, p.position.z);
      colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
      sizes.push(p.currentSize);
      angles.push(p.rotation);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colours, 4));
    geometry.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1));

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
    geometry.attributes.aColor.needsUpdate = true;
    geometry.attributes.angle.needsUpdate = true;
  }

  function start() { _running = true; }

  function stop({ clear = true } = {}) {
    _running = false;
    if (clear) {
      _particles = [];
      _UpdateGeometry();
    }
  }

  // Minimal-flexibel: Optionen zur Laufzeit setzen
  function setOptions(o = {}) {
    if (o.rate != null) cfg.rate = o.rate;
    if (o.maxParticles != null) cfg.maxParticles = o.maxParticles;
    if (o.radius != null) cfg.radius = o.radius;
    if (o.maxLife != null) cfg.maxLife = o.maxLife;
    if (o.maxSize != null) cfg.maxSize = o.maxSize;
    if (o.dragCoeff != null) cfg.dragCoeff = o.dragCoeff;

    if (o.baseVelocity instanceof THREE.Vector3) cfg.baseVelocity.copy(o.baseVelocity);
    if (o.velocityJitter instanceof THREE.Vector3) cfg.velocityJitter.copy(o.velocityJitter);

    if (o.alphaPoints) alphaSpline.setPoints(o.alphaPoints);
    if (o.sizePoints) sizeSpline.setPoints(o.sizePoints);
    if (o.colorPoints) colorSpline.setPoints(o.colorPoints.map(([t, hex]) => [t, new THREE.Color(hex)]));
  }

  function setIntensity(x) {
    cfg.intensity = THREE.MathUtils.clamp(x, 0, 1);
  }

  function update(dt) {
    uniforms.pointMultiplier.value = computePointMultiplier(camera);
    _AddParticles(dt);
    _UpdateParticles(dt);
    _UpdateGeometry();
  }

  function dispose() {
    stop({ clear: true });
    parent.remove(_points);
    geometry.dispose();
    _material.dispose();
    tex.dispose();
  }

  return { points: _points, start, stop, update, dispose, setOptions, setIntensity };
}

export { getParticleSystem };
