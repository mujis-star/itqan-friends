import * as THREE from 'three';
import { initRenderer, getRenderer } from './renderer.js';
import { initCamera, getCamera } from './camera.js';
import { initLighting } from './lighting.js';
import { createParticleSystem, updateParticles } from './particles.js';

let scene, renderer, camera, particles;
let mouse = { x: 0, y: 0 };
let targetMouse = { x: 0, y: 0 };
let isReducedMotion = false;
let animationFrameId;

export function initThreeScene(canvasId) {
    // 1. Capability Detection (Disable on mobile, low battery, or reduced motion)
    isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth <= 768;
    const isSaveData = navigator.connection && navigator.connection.saveData;
    
    if (isReducedMotion || isSaveData || (isMobile && !checkWebGLCapabilities())) {
        console.log("WebGL gracefully disabled based on capability/preference detection.");
        return;
    }

    // 2. Setup Core Components
    renderer = initRenderer(canvasId);
    if (!renderer) return;

    camera = initCamera();
    scene = new THREE.Scene();
    
    // Deep dark cinematic fog
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.04);
    scene.background = new THREE.Color(0x0a0a0f);

    // 3. Add Lighting & Elements
    initLighting(scene);
    
    particles = createParticleSystem();
    scene.add(particles);

    // 4. Cursor Interactions
    window.addEventListener('mousemove', onMouseMove);

    // 5. Start Loop
    animate();
}

function checkWebGLCapabilities() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

function onMouseMove(event) {
    // Normalize mouse coordinates to -1 to +1
    targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
    animationFrameId = requestAnimationFrame(animate);

    // Smooth cursor interpolation (lerp)
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    // Subtle parallax effect on camera based on mouse
    if (camera) {
        camera.position.x = mouse.x * 0.5;
        camera.position.y = mouse.y * 0.5;
        camera.lookAt(scene.position);
    }

    // Update Particles
    updateParticles(particles);

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

export function destroyThreeScene() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    window.removeEventListener('mousemove', onMouseMove);
    // Add cleanup logic for meshes/materials if needed
}
