import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';

document.addEventListener("DOMContentLoaded", () => {
    initThreeScene();
});

function initThreeScene() {
    const canvas = document.getElementById("webgl-canvas");
    if (!canvas) return;

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    
    // Set background and heavy volumetric fog to a dark cinematic color
    scene.fog = new THREE.FogExp2(0x111111, 0.04);
    scene.background = new THREE.Color(0x111111);

    // Setup Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);

    // Setup WebGL Renderer with mobile-optimized pixel ratio
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: false, 
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- 2. Lighting ---
    // Subtle ambient fill light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Dramatic downward SpotLight for strong shadows
    const spotLight = new THREE.SpotLight(0xffffff, 2.5);
    spotLight.position.set(0, 10, 5);
    spotLight.angle = Math.PI / 5;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Glowing neon blue PointLight for cinematic rim lighting
    const blueNeonLight = new THREE.PointLight(0x00f3ff, 3, 20);
    blueNeonLight.position.set(4, 2, 2);
    scene.add(blueNeonLight);

    // --- 3. Model Loading & Fallback Logic ---
    let currentModel = null;
    const loader = new GLTFLoader();
    
    // Fail-safe function: Spawns a high-detail TorusKnot if GLB fails to load
    function createFallbackGeometry() {
        const geometry = new THREE.TorusKnotGeometry(1.5, 0.5, 256, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            roughness: 0.1,
            metalness: 0.95
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    const modelUrl = 'RobotExpressive.glb';
    
    loader.load(
        modelUrl,
        (gltf) => {
            currentModel = gltf.scene;
            scene.add(currentModel);
        },
        undefined,
        (error) => {
            console.warn('Failed to load GLB model. Executing Fail-Safe Fallback.', error);
            // CRUCIAL: Load the fallback TorusKnot to prevent a black screen
            currentModel = createFallbackGeometry();
            scene.add(currentModel);
        }
    );

    // --- 4. GSAP Drag-to-Scrub Interaction ---
    let isDragging = false;
    let previousX = 0;
    let targetRotationY = 0;

    const handleDragStart = (x) => {
        isDragging = true;
        previousX = x;
        // Change cursor style on body for visual feedback
        document.body.style.cursor = 'grabbing';
    };

    const handleDragMove = (x) => {
        if (!isDragging || !currentModel) return;
        
        const deltaX = x - previousX;
        
        // Map horizontal drag distance to rotation (Full screen drag = 360deg rotation)
        const rotationDelta = (deltaX / window.innerWidth) * Math.PI * 2;
        targetRotationY += rotationDelta;
        
        // Use GSAP to animate the rotation for smooth, decelerating inertia
        gsap.to(currentModel.rotation, {
            y: targetRotationY,
            duration: 1.5, // Inertia deceleration duration
            ease: "power2.out",
            overwrite: "auto"
        });
        
        previousX = x;
    };

    const handleDragEnd = () => {
        isDragging = false;
        document.body.style.cursor = 'default';
    };

    // Attach global listeners to the window so dragging works over existing UI overlays
    window.addEventListener('mousedown', (e) => handleDragStart(e.clientX));
    window.addEventListener('mousemove', (e) => handleDragMove(e.clientX));
    window.addEventListener('mouseup', handleDragEnd);

    window.addEventListener('touchstart', (e) => handleDragStart(e.touches[0].clientX), { passive: false });
    window.addEventListener('touchmove', (e) => handleDragMove(e.touches[0].clientX), { passive: false });
    window.addEventListener('touchend', handleDragEnd);

    // --- 5. Animation Loop ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        // Add a slight cinematic idle float when not actively dragging
        if (currentModel && !isDragging) {
            const elapsedTime = clock.getElapsedTime();
            currentModel.position.y = -2 + Math.sin(elapsedTime * 0.5) * 0.2;
            currentModel.rotation.x = Math.sin(elapsedTime * 0.3) * 0.1;
            currentModel.rotation.z = Math.cos(elapsedTime * 0.2) * 0.1;
        }

        renderer.render(scene, camera);
    }
    animate();

    // --- 6. Responsiveness ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
