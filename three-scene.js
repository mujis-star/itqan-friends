import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';

document.addEventListener("DOMContentLoaded", () => {
    initThreeScene();
});

function initThreeScene() {
    const canvas = document.getElementById("hero3DCanvas");
    if (!canvas) return;

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    
    // Heavy volumetric fog with dark hex color
    scene.fog = new THREE.FogExp2(0x111111, 0.04);
    // Setting background color to match the fog
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: false, 
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Mobile optimization
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- 2. Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Bright SpotLight pointing downward
    const spotLight = new THREE.SpotLight(0xffffff, 2.5);
    spotLight.position.set(0, 10, 5);
    spotLight.angle = Math.PI / 5;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Glowing neon blue PointLight for rim lighting
    const blueNeonLight = new THREE.PointLight(0x00f3ff, 3, 20);
    blueNeonLight.position.set(4, 2, 2);
    scene.add(blueNeonLight);

    // --- 3. Model Loading & Fallback ---
    let currentModel = null;
    const loader = new GLTFLoader();
    
    // Add a temporary loading text (font-family: Montserrat as requested)
    const loadingDiv = document.createElement('div');
    loadingDiv.innerText = 'Loading 3D Environment...';
    Object.assign(loadingDiv.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        color: '#fff',
        fontFamily: "'Montserrat', 'Helvetica', sans-serif",
        fontSize: '14px',
        opacity: '0.5',
        pointerEvents: 'none',
        zIndex: '0'
    });
    document.body.appendChild(loadingDiv);

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

    const modelUrl = 'PLACEHOLDER_URL_TO_TEST_FALLBACK.glb';
    
    loader.load(
        modelUrl,
        (gltf) => {
            currentModel = gltf.scene;
            scene.add(currentModel);
            loadingDiv.remove();
        },
        undefined,
        (error) => {
            console.warn('Failed to load GLB model. Falling back to TorusKnotGeometry.', error);
            // Crucial Fallback Logic
            currentModel = createFallbackGeometry();
            scene.add(currentModel);
            loadingDiv.innerText = 'Fallback 3D Environment Loaded';
            setTimeout(() => loadingDiv.remove(), 2000);
        }
    );

    // --- 4. GSAP Drag-to-Scrub Interaction ---
    let isDragging = false;
    let previousX = 0;
    
    // We maintain a target rotation value
    let targetRotationY = 0;

    const handleDragStart = (x) => {
        isDragging = true;
        previousX = x;
        canvas.style.cursor = 'grabbing';
    };

    const handleDragMove = (x) => {
        if (!isDragging) return;
        
        const deltaX = x - previousX;
        
        // Map drag distance to rotation
        // Dragging full width of screen rotates by PI (180 degrees)
        const rotationDelta = (deltaX / window.innerWidth) * Math.PI * 2;
        targetRotationY += rotationDelta;
        
        if (currentModel) {
            // Use GSAP to animate the rotation for smooth inertia and deceleration
            gsap.to(currentModel.rotation, {
                y: targetRotationY,
                duration: 1.5, // The duration of the inertia deceleration
                ease: "power2.out",
                overwrite: "auto"
            });
        }
        
        previousX = x;
    };

    const handleDragEnd = () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    };

    // Listeners on the window so dragging works globally
    window.addEventListener('mousedown', (e) => handleDragStart(e.clientX));
    window.addEventListener('mousemove', (e) => handleDragMove(e.clientX));
    window.addEventListener('mouseup', handleDragEnd);

    window.addEventListener('touchstart', (e) => handleDragStart(e.touches[0].clientX));
    window.addEventListener('touchmove', (e) => handleDragMove(e.touches[0].clientX));
    window.addEventListener('touchend', handleDragEnd);
    
    canvas.style.cursor = 'grab';

    // --- 5. Animation Loop ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        // Add a slight idle floating animation for atmosphere
        const elapsedTime = clock.getElapsedTime();
        if (currentModel && !isDragging) {
            // Idle floating
            currentModel.position.y = Math.sin(elapsedTime * 0.5) * 0.2;
            
            // If we aren't overriding the rotation via GSAP, we can add a very slow idle spin
            // but since GSAP controls rotation.y, let's idle rotate on X and Z slightly
            currentModel.rotation.x = Math.sin(elapsedTime * 0.3) * 0.1;
            currentModel.rotation.z = Math.cos(elapsedTime * 0.2) * 0.1;
        }

        renderer.render(scene, camera);
    }
    animate();

    // --- 6. Resize Handler ---
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
