import * as THREE from 'three';

export function createParticleSystem() {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        // Random spread across the screen
        positions[i * 3] = (Math.random() - 0.5) * 20; // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5; // z

        velocities.push({
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Material with soft glow
    const material = new THREE.PointsMaterial({
        color: 0x00f3ff,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData = { velocities };

    return particles;
}

export function updateParticles(particles) {
    if (!particles) return;
    
    const positions = particles.geometry.attributes.position.array;
    const velocities = particles.userData.velocities;

    for (let i = 0; i < velocities.length; i++) {
        // Add velocity
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;

        // Bounce off bounds gently
        if (Math.abs(positions[i * 3]) > 10) velocities[i].x *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 10) velocities[i].y *= -1;
        if (positions[i * 3 + 2] > 5 || positions[i * 3 + 2] < -15) velocities[i].z *= -1;
    }

    particles.geometry.attributes.position.needsUpdate = true;
}
