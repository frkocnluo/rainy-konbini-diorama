import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { buildBaseAndRoads } from './scene/baseAndRoads.js';
import { buildKonbini } from './scene/konbini.js';
import { buildStreetProps } from './scene/streetProps.js';
import { buildAlleyAndService } from './scene/alleyAndService.js';
import { buildAtmosphere } from './scene/atmosphere.js';

function init() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x101730, 0.011);

  const camera = new THREE.PerspectiveCamera(
    36,
    window.innerWidth / window.innerHeight,
    0.2,
    200
  );
  camera.position.set(16.0, 11.4, 17.2);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  document.body.appendChild(renderer.domElement);

  // Free orbit, drag, zoom controls (no UI)
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(-0.3, 1.05, -0.2);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.minDistance = 7.5;
  controls.maxDistance = 42.0;
  controls.minPolarAngle = 0.08;
  controls.maxPolarAngle = Math.PI * 0.54;
  controls.update();

  // --- Lighting: Anime Rainy Night Hierarchy ---
  const hemiLight = new THREE.HemisphereLight(0x738ed4, 0x161c36, 0.92);
  scene.add(hemiLight);

  const moonLight = new THREE.DirectionalLight(0x90b4ff, 1.15);
  moonLight.position.set(-12, 18, 13);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  moonLight.shadow.camera.near = 2;
  moonLight.shadow.camera.far = 48;
  moonLight.shadow.camera.left = -11;
  moonLight.shadow.camera.right = 11;
  moonLight.shadow.camera.top = 11;
  moonLight.shadow.camera.bottom = -11;
  moonLight.shadow.bias = -0.0005;
  scene.add(moonLight);

  // Subtle cool rim fill from behind so back silhouettes separate cleanly
  const backRimLight = new THREE.DirectionalLight(0x5278cc, 0.55);
  backRimLight.position.set(10, 9, -14);
  scene.add(backRimLight);

  // Warm konbini interior glow
  const storeInteriorLight = new THREE.PointLight(0xffdfb0, 7.5, 11.5, 1.5);
  storeInteriorLight.position.set(-1.1, 2.65, -0.85);
  scene.add(storeInteriorLight);

  // Warm entrance canopy spill over automatic door, mat, umbrella stand & bicycle
  const canopySpillLight = new THREE.PointLight(0xffe7c2, 5.2, 8.0, 1.6);
  canopySpillLight.position.set(-0.8, 2.55, 2.0);
  scene.add(canopySpillLight);

  // Cool cyan glow from twin vending machines onto right sidewalk & puddle
  const vendingLight = new THREE.PointLight(0x7ce2ff, 3.8, 6.2, 1.7);
  vendingLight.position.set(3.0, 1.35, -2.05);
  scene.add(vendingLight);

  // Warm streetlamp amber pool over corner crosswalk & puddles
  const streetlampLight = new THREE.PointLight(0xffcb82, 7.2, 11.5, 1.55);
  streetlampLight.position.set(4.15, 4.45, 4.15);
  streetlampLight.castShadow = true;
  streetlampLight.shadow.mapSize.set(512, 512);
  streetlampLight.shadow.bias = -0.001;
  scene.add(streetlampLight);

  // Cozy dim warm lantern glow inside left alley entrance
  const alleyLight = new THREE.PointLight(0xffb466, 3.2, 6.0, 1.7);
  alleyLight.position.set(-5.15, 2.25, -0.35);
  scene.add(alleyLight);

  // Tall corner pylon sign subtle teal halo
  const pylonLight = new THREE.PointLight(0x8eead8, 2.8, 6.0, 1.7);
  pylonLight.position.set(3.25, 3.7, -4.0);
  scene.add(pylonLight);

  // Cool white-blue utility pole security light over front-left sidewalk & hydrangea planter
  const poleSecLight = new THREE.PointLight(0xa4e2ff, 3.2, 7.2, 1.7);
  poleSecLight.position.set(-6.5, 4.1, 3.2);
  scene.add(poleSecLight);

  // --- Assemble Diorama Scene ---
  const diorama = new THREE.Group();
  diorama.name = 'RainyKonbiniDiorama';

  const baseAndRoads = buildBaseAndRoads();
  const konbini = buildKonbini();
  const streetProps = buildStreetProps();
  const alleyAndService = buildAlleyAndService();
  const atmosphere = buildAtmosphere();

  diorama.add(
    baseAndRoads.group,
    konbini.group,
    streetProps,
    alleyAndService.group
  );
  scene.add(diorama);
  scene.add(atmosphere.group);

  // Resize handler
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Animation loop
  let lastTime = performance.now();
  const startTime = lastTime;
  function animate(now) {
    requestAnimationFrame(animate);
    const delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const elapsed = (now - startTime) / 1000;

    controls.update();
    baseAndRoads.update(elapsed);
    konbini.update(elapsed);
    alleyAndService.update(delta, elapsed);
    atmosphere.update(delta);

    // Gentle living neon/lamp pulse
    alleyLight.intensity = 3.1 + Math.sin(elapsed * 4.5) * 0.14;
    vendingLight.intensity = 3.75 + Math.sin(elapsed * 2.1 + 1.0) * 0.12;

    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
}

init();
