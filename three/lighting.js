import * as THREE from 'three';

export function initLighting(scene) {
    // Subtle ambient fill light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    // Dramatic downward SpotLight for strong shadows
    const spotLight = new THREE.SpotLight(0xffffff, 2.5);
    spotLight.position.set(0, 10, 5);
    spotLight.angle = Math.PI / 5;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Glowing neon blue PointLight for cinematic rim lighting
    const blueNeonLight = new THREE.PointLight(0x00f3ff, 4, 30);
    blueNeonLight.position.set(5, 3, 2);
    scene.add(blueNeonLight);
    
    // Pink accent light for brand colors
    const pinkNeonLight = new THREE.PointLight(0xff00ff, 3, 20);
    pinkNeonLight.position.set(-5, -2, 2);
    scene.add(pinkNeonLight);
    
    return { ambientLight, spotLight, blueNeonLight, pinkNeonLight };
}
