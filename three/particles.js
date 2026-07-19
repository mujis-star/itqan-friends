import * as THREE from 'three';

export function createParticleSystem() {
    const particleCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Create a dense horizontal band of network nodes (collaboration theme)
    for (let i = 0; i < particleCount; i++) {
        // Distribute mostly in a wide cylindrical or planar band
        const x = (Math.random() - 0.5) * 40;
        const y = (Math.random() - 0.5) * 10 - 2; // Keep them lower
        const z = (Math.random() - 0.5) * 20 - 5;
        
        positions[i*3] = x;
        positions[i*3+1] = y;
        positions[i*3+2] = z;
        
        originalPositions[i*3] = x;
        originalPositions[i*3+1] = y;
        originalPositions[i*3+2] = z;
        
        sizes[i] = Math.random() * 0.1 + 0.02; // Varied node sizes
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aOriginalPosition', new THREE.BufferAttribute(originalPositions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom shader material for glowing network nodes
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color1: { value: new THREE.Color(0x00f3ff) }, // Cyan
            color2: { value: new THREE.Color(0xff00ff) }  // Magenta
        },
        vertexShader: `
            uniform float time;
            attribute vec3 aOriginalPosition;
            attribute float size;
            varying vec3 vPos;
            void main() {
                vPos = aOriginalPosition;
                vec3 pos = aOriginalPosition;
                
                // Fluid wave motion based on sine waves simulating network data flow
                pos.y += sin(time * 0.5 + pos.x * 0.2) * 1.5;
                pos.z += cos(time * 0.4 + pos.y * 0.3) * 1.0;
                pos.x += sin(time * 0.3 + pos.z * 0.2) * 1.0;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                
                // Closer particles appear larger
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec3 vPos;
            void main() {
                // Circular soft particle
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;
                
                // Soft glow
                float alpha = (0.5 - dist) * 2.0;
                
                // Mix colors based on position
                float mixFactor = (vPos.x + 20.0) / 40.0;
                vec3 finalColor = mix(color2, color1, mixFactor);
                
                gl_FragColor = vec4(finalColor, alpha * 0.6);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    return particles;
}

export function updateParticles(particles) {
    if (!particles) return;
    particles.material.uniforms.time.value += 0.015;
}
