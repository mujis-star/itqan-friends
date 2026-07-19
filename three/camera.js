import * as THREE from 'three';

let camera;

export function initCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);
    
    // Add event listener for resizing
    window.addEventListener('resize', onWindowResize, false);
    
    return camera;
}

export function getCamera() {
    return camera;
}

function onWindowResize() {
    if (!camera) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
