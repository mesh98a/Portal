import * as THREE from 'three';


export function addPortalRing(
    innerRadius = 0.48,   // Loch in der Mitte
    outerRadius = 0.5,    // Gesamtgröße
    color = "green"
) {
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 32);

    const material = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,   // Sichtbar von beiden Seiten
        transparent: true,
        opacity: 0.8              // leichter Glow
    });

    const ring = new THREE.Mesh(geometry, material);

    ring.rotation.x = 0;
    return ring;
}

export function addMagicPortal(
    innerRadius = 0.48,
    outerRadius = 0.50
) {
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);

    const material = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: {
            time: { value: 0.0 },
            color: { value: new THREE.Color(0x55ccff) }
        }
    });

    const portal = new THREE.Mesh(geometry, material);
    return portal;
}

export function addHole(radius = 0.48) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load('image.png');
    const geometry = new THREE.CircleGeometry(radius, 128);

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true
    });
    return new THREE.Mesh(geometry, material);
}


export function addPortalParticles(radius = 0.12, count = 100) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = radius + (Math.random() - 0.5) * 0.01; // leicht variierend
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        const z = (Math.random() - 0.5) * 0.01; // leichte Tiefe
        positions.push(x, y, z);
        sizes.push(Math.random() * 2 + 1);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        color: 0x55ccff,
        size: 0.025,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geometry, material);
}





