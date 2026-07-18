// three-scene.js

document.addEventListener("DOMContentLoaded", () => {
    initThreeScene();
});

function initThreeScene() {
    const canvas = document.getElementById("hero3DCanvas");
    if (!canvas) return;

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    
    // Add subtle fog for atmospheric effect
    scene.fog = new THREE.FogExp2('#05020a', 0.04);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        alpha: true, 
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // --- 2. Lighting ---
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Spotlight pointing down for dramatic shadows
    const spotLight = new THREE.SpotLight(0xffffff, 1.5);
    spotLight.position.set(0, 10, 5);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Neon tube lights (PointLights)
    const cyanLight = new THREE.PointLight(0xd946ef, 2, 20); // Cyan/Purple
    cyanLight.position.set(-4, 0, 2);
    scene.add(cyanLight);

    const roseLight = new THREE.PointLight(0xf43f5e, 2, 20); // Rose
    roseLight.position.set(4, -2, 2);
    scene.add(roseLight);


    // --- 3. Model Loading & Placeholder ---
    let mixer; // AnimationMixer
    let animationDuration = 5; // Placeholder duration
    
    // Create a cinematic geometric placeholder until the user provides a GLTF model
    const geometry = new THREE.IcosahedronGeometry(2, 2);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x111111,
        roughness: 0.2,
        metalness: 0.9
    });
    const cube = new THREE.Mesh(geometry, material); // Keeping the variable name 'cube' for the mixer below
    cube.castShadow = true;
    cube.receiveShadow = true;
    
    // Add a glowing wireframe overlay for that "AI-generated" tech look
    const wireframeMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xd946ef, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.3 
    });
    const wireframe = new THREE.Mesh(geometry, wireframeMaterial);
    wireframe.scale.set(1.01, 1.01, 1.01);
    cube.add(wireframe);
    
    scene.add(cube);

    // Create a simple animation for the placeholder to test scrubbing
    const times = [0, 5];
    const values = [0, 0, 0, 0, 3, 0]; // Move up along Y axis
    
    const track = new THREE.VectorKeyframeTrack('.position', times, values);
    const clip = new THREE.AnimationClip('move', 5, [track]);
    
    mixer = new THREE.AnimationMixer(cube);
    const action = mixer.clipAction(clip);
    action.play();
    mixer.setTime(0); // Initialize at frame 0
    action.paused = true; // Pause it so we can scrub it manually

    /* 
    // GLTF Loader scaffolding (Commented out until URL is provided)
    const loader = new THREE.GLTFLoader();
    const modelUrl = 'YOUR_MODEL_URL_HERE.gltf';
    loader.load(modelUrl, (gltf) => {
        scene.remove(cube); // Remove placeholder
        
        const model = gltf.scene;
        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        scene.add(model);

        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            animationDuration = gltf.animations[0].duration;
            action.play();
            action.paused = true; // Manual scrub
        }
    });
    */

    // --- 4. Drag to Scrub Interaction ---
    let isDragging = false;
    let startX = 0;
    let currentScrubTime = 0; // Current time in animation
    let targetScrubTime = 0; // Target time based on drag
    
    const handleDragStart = (x) => {
        isDragging = true;
        startX = x;
        canvas.style.cursor = 'grabbing';
    };

    const handleDragMove = (x) => {
        if (!isDragging) return;
        
        const deltaX = x - startX;
        // Map screen drag distance to animation duration (e.g., full screen drag = full animation)
        const scrubSensitivity = window.innerWidth; 
        
        let timeOffset = (deltaX / scrubSensitivity) * animationDuration;
        targetScrubTime = Math.max(0, Math.min(animationDuration, currentScrubTime + timeOffset));
        
        startX = x; // Reset startX for relative dragging
        currentScrubTime = targetScrubTime;
    };

    const handleDragEnd = () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
    };

    // Mouse Events
    canvas.addEventListener('mousedown', (e) => handleDragStart(e.clientX));
    window.addEventListener('mousemove', (e) => handleDragMove(e.clientX));
    window.addEventListener('mouseup', handleDragEnd);

    // Touch Events
    canvas.addEventListener('touchstart', (e) => handleDragStart(e.touches[0].clientX));
    window.addEventListener('touchmove', (e) => handleDragMove(e.touches[0].clientX));
    window.addEventListener('touchend', handleDragEnd);
    
    canvas.style.cursor = 'grab';

    // --- 5. Animation Loop ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        // Smoothly interpolate the mixer time towards the target scrub time
        if (mixer) {
            // Apply easing to the scrub time for smoothness
            const timeDiff = targetScrubTime - mixer.time;
            mixer.setTime(mixer.time + timeDiff * 0.1); 
        }

        // Add a slight idle floating animation to the camera for atmosphere
        const elapsedTime = clock.getElapsedTime();
        camera.position.x = Math.sin(elapsedTime * 0.2) * 0.5;
        camera.position.y = 2 + Math.cos(elapsedTime * 0.3) * 0.3;
        camera.lookAt(0, 0, 0);

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
