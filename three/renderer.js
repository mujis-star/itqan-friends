import * as THREE from 'three';

let renderer;
let canvas;

export function initRenderer(canvasId) {
    canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: false,
        antialias: true,
        powerPreference: "high-performance"
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Add event listener for resizing
    window.addEventListener('resize', onWindowResize, false);
    
    return renderer;
}

export function getRenderer() {
    return renderer;
}

function onWindowResize() {
    if (!renderer) return;
    renderer.setSize(window.innerWidth, window.innerHeight);
}
