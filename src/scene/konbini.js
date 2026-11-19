import * as THREE from 'three';
import { celMat, glowMat, createCelMesh, createGlowSprite } from '../style/cel.js';
import {
  createKonbiniFasciaTexture,
  createKonbiniSideFasciaTexture,
  createWindowPosterTexture,
  createInteriorShelfTexture,
  createDoorMatTexture,
  createWallTileTexture,
  createNoboriTexture,
} from '../style/textures.js';

export function buildKonbini() {
  const group = new THREE.Group();
  group.name = 'Konbini';

  const floorY = 0.16; // Sidewalk height

  // --- Shared Materials ---
  const wallTileTex = createWallTileTexture(4, 2);
  const wallCreamMat = celMat(0xf5f1e8, {
    map: wallTileTex,
    rimStrength: 0.24,
    shadowTint: 0x202748,
    shadowTintStrength: 0.36,
  });
  const plinthMat = celMat(0x414b69, { rimStrength: 0.22, wetness: 0.28 });
  const roofMat = celMat(0x303854, { rimStrength: 0.24, wetness: 0.48 });
  const frameDarkMat = celMat(0x28314b, { rimStrength: 0.25 });
  const trimTealMat = celMat(0x199e93, { rimStrength: 0.22 });
  const gutterMat = celMat(0x3a4463, { rimStrength: 0.24 });

  // Building footprint: x in [-4.4, +2.0] (w=6.4), z in [-4.2, +1.2] (d=5.4)
  // Center: x = -1.2, z = -1.5

  // 1. Store Interior Shell (Floor, Back/Left Walls, Ceiling Light Grid)
  const interiorFloor = new THREE.Mesh(
    new THREE.BoxGeometry(6.1, 0.04, 5.1),
    celMat(0xf2eadb, { emissive: 0x453520, emissiveIntensity: 0.45 })
  );
  interiorFloor.position.set(-1.2, floorY + 0.02, -1.5);
  interiorFloor.receiveShadow = true;
  group.add(interiorFloor);

  // Back wall (z = -4.15)
  const backWall = createCelMesh(
    new THREE.BoxGeometry(6.4, 3.25, 0.22),
    wallCreamMat,
    { outline: 0, edges: true, edgeOpacity: 0.65 }
  );
  backWall.position.set(-1.2, floorY + 1.625, -4.09);
  group.add(backWall);

  // Left wall (x = -4.35, facing the small alley)
  const leftWall = createCelMesh(
    new THREE.BoxGeometry(0.22, 3.25, 5.4),
    wallCreamMat,
    { outline: 0, edges: true, edgeOpacity: 0.65 }
  );
  leftWall.position.set(-4.29, floorY + 1.625, -1.5);
  group.add(leftWall);

  // Left wall lower dark wainscot
  const leftWainscot = createCelMesh(
    new THREE.BoxGeometry(0.25, 0.42, 5.42),
    plinthMat,
    { outline: 0, edges: true, edgeOpacity: 0.55 }
  );
  leftWainscot.position.set(-4.29, floorY + 0.21, -1.5);
  group.add(leftWainscot);

  // Back wall lower wainscot
  const backWainscot = createCelMesh(
    new THREE.BoxGeometry(6.42, 0.42, 0.25),
    plinthMat,
    { outline: 0, edges: true, edgeOpacity: 0.55 }
  );
  backWainscot.position.set(-1.2, floorY + 0.21, -4.09);
  group.add(backWainscot);

  // Right rear solid wall section (x = +1.89, z = -4.2 .. -0.85)
  const rightSolidWall = createCelMesh(
    new THREE.BoxGeometry(0.22, 3.25, 3.35),
    wallCreamMat,
    { outline: 0, edges: true, edgeOpacity: 0.65 }
  );
  rightSolidWall.position.set(1.89, floorY + 1.625, -2.525);
  group.add(rightSolidWall);

  const rightWainscot = createCelMesh(
    new THREE.BoxGeometry(0.25, 0.42, 3.37),
    plinthMat,
    { outline: 0, edges: true, edgeOpacity: 0.55 }
  );
  rightWainscot.position.set(1.89, floorY + 0.21, -2.525);
  group.add(rightWainscot);

  // Warm interior ceiling slab & glowing fluorescent light strips
  const ceilingSlab = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 0.14, 5.2),
    celMat(0xf7f1e4, { emissive: 0xffe4b8, emissiveIntensity: 0.55 })
  );
  ceilingSlab.position.set(-1.2, floorY + 3.1, -1.5);
  group.add(ceilingSlab);

  const ceilingLightMat = glowMat(0xfff1cf, { intensity: 1.45 });
  for (let lz = -3.0; lz <= 0.0; lz += 1.45) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.05, 0.28), ceilingLightMat);
    strip.position.set(-1.2, floorY + 3.01, lz);
    group.add(strip);
  }

  // --- 2. Detailed Interior Fixtures (visible through windows!) ---
  const coolerTex = createInteriorShelfTexture('cooler');
  const snackTex = createInteriorShelfTexture('snack');

  // Back wall refrigerated beverage coolers
  const coolerBody = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 2.05, 0.55),
    celMat(0xdbe9f5, { emissive: 0xaadfff, emissiveIntensity: 0.35 })
  );
  coolerBody.position.set(-1.6, floorY + 1.05, -3.62);
  group.add(coolerBody);

  const coolerDisplay = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 1.8),
    glowMat(0xffffff, { map: coolerTex, intensity: 0.98 })
  );
  coolerDisplay.position.set(-1.6, floorY + 1.08, -3.33);
  group.add(coolerDisplay);

  // Two middle snack/bento gondola shelves
  const gondolaMat = celMat(0xe8dec9, { emissive: 0x5c4830, emissiveIntensity: 0.3 });
  const snackFaceMat = glowMat(0xfff4e0, { map: snackTex, intensity: 0.76 });
  [-2.05, -0.75].forEach((gz) => {
    const shelf = createCelMesh(new THREE.BoxGeometry(2.7, 1.28, 0.48), gondolaMat, {
      outline: 0,
      edges: true,
      edgeOpacity: 0.45,
    });
    shelf.position.set(-2.3, floorY + 0.66, gz);
    group.add(shelf);

    const frontFace = new THREE.Mesh(new THREE.PlaneGeometry(2.55, 1.1), snackFaceMat);
    frontFace.position.set(-2.3, floorY + 0.72, gz + 0.245);
    group.add(frontFace);
  });

  // Front-window Magazine Stand (雑誌コーナー) right behind left shopfront glass
  const magStand = createCelMesh(new THREE.BoxGeometry(2.2, 0.92, 0.36), gondolaMat, {
    outline: 0,
    edges: true,
    edgeOpacity: 0.5,
  });
  magStand.position.set(-2.7, floorY + 0.46, 0.72);
  group.add(magStand);

  const magFace = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 0.75), snackFaceMat);
  magFace.position.set(-2.7, floorY + 0.54, 0.91);
  group.add(magFace);

  // Checkout Counter (レジカウンター) on the right interior
  const counterBase = createCelMesh(
    new THREE.BoxGeometry(1.45, 0.95, 2.2),
    celMat(0xf0ece2, { emissive: 0x453422, emissiveIntensity: 0.35 }),
    { outline: 0, edges: true, edgeOpacity: 0.55 }
  );
  counterBase.position.set(0.85, floorY + 0.48, -1.75);
  group.add(counterBase);

  const counterTop = createCelMesh(
    new THREE.BoxGeometry(1.52, 0.08, 2.26),
    trimTealMat,
    { outline: 0, edges: true, edgeOpacity: 0.55 }
  );
  counterTop.position.set(0.85, floorY + 0.98, -1.75);
  group.add(counterTop);

  // POS Register & glowing screen + warm nikuman steamer case on counter
  const posBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 0.36), frameDarkMat);
  posBody.position.set(0.75, floorY + 1.15, -1.4);
  group.add(posBody);

  const posScreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.22, 0.28),
    glowMat(0x8ae8ff, { intensity: 1.25 })
  );
  posScreen.position.set(0.92, floorY + 1.25, -1.4);
  group.add(posScreen);

  const steamerCase = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.45, 0.42),
    glowMat(0xffd28a, { intensity: 1.15, transparent: true, opacity: 0.9 })
  );
  steamerCase.position.set(0.82, floorY + 1.24, -2.35);
  group.add(steamerCase);

  // --- 3. Shopfront Windows (玻璃橱窗) & Automatic Sliding Doors (自动门) ---
  // Low concrete wall knee-wall under front & corner windows
  const frontKneeLeft = createCelMesh(
    new THREE.BoxGeometry(2.85, 0.44, 0.22),
    plinthMat,
    { outline: 0, edges: true, edgeOpacity: 0.6 }
  );
  frontKneeLeft.position.set(-2.975, floorY + 0.22, 1.09);
  group.add(frontKneeLeft);

  const frontKneeRight = createCelMesh(
    new THREE.BoxGeometry(1.65, 0.44, 0.22),
    plinthMat,
    { outline: 0, edges: true, edgeOpacity: 0.6 }
  );
  frontKneeRight.position.set(1.175, floorY + 0.22, 1.09);
  group.add(frontKneeRight);

  const cornerKneeSide = createCelMesh(
    new THREE.BoxGeometry(0.22, 0.44, 2.05),
    plinthMat,
    { outline: 0, edges: true, edgeOpacity: 0.6 }
  );
  cornerKneeSide.position.set(1.89, floorY + 0.22, 0.175);
  group.add(cornerKneeSide);

  // Structural corner columns & window header beams
  const cornerPostPositions = [
    [-4.29, 1.09],
    [-1.48, 1.09],
    [0.36, 1.09],
    [1.89, 1.09],
    [1.89, -0.85],
  ];
  cornerPostPositions.forEach(([px, pz]) => {
    const col = createCelMesh(new THREE.BoxGeometry(0.22, 2.6, 0.22), wallCreamMat, {
      outline: 0,
      edges: true,
      edgeOpacity: 0.6,
    });
    col.position.set(px, floorY + 1.3, pz);
    group.add(col);
  });

  // Upper facade spandrel walls above windows/doors
  const frontHeader = createCelMesh(
    new THREE.BoxGeometry(6.4, 0.72, 0.24),
    wallCreamMat,
    { outline: 0, edges: true, edgeOpacity: 0.6 }
  );
  frontHeader.position.set(-1.2, floorY + 2.89, 1.09);
  group.add(frontHeader);

  const sideCornerHeader = createCelMesh(
    new THREE.BoxGeometry(0.24, 0.72, 2.05),
    wallCreamMat,
    { outline: 0, edges: true, edgeOpacity: 0.6 }
  );
  sideCornerHeader.position.set(1.89, floorY + 2.89, 0.175);
  group.add(sideCornerHeader);

  // Glass Material (clean semi-transparent anime cyan-tinted glass)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xdff5ff,
    transparent: true,
    opacity: 0.26,
    roughness: 0.08,
    metalness: 0.0,
    reflectivity: 0.85,
    depthWrite: false,
  });

  // Left main shopfront window (x: -4.18 to -1.58, y: +0.44 to +2.52)
  const leftWindowPane = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.08, 0.04), glassMat);
  leftWindowPane.position.set(-2.88, floorY + 1.48, 1.09);
  group.add(leftWindowPane);

  // Vertical aluminum mullions on left window
  [-3.32, -2.44].forEach((mx) => {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.08, 0.08), frameDarkMat);
    mullion.position.set(mx, floorY + 1.48, 1.09);
    group.add(mullion);
  });

  // Right-front corner window (x: +0.47 to +1.78)
  const rightFrontPane = new THREE.Mesh(new THREE.BoxGeometry(1.31, 2.08, 0.04), glassMat);
  rightFrontPane.position.set(1.125, floorY + 1.48, 1.09);
  group.add(rightFrontPane);

  // Right-side wrap window (x = +1.89, z: -0.74 to +0.98)
  const sidePane = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.08, 1.72), glassMat);
  sidePane.position.set(1.89, floorY + 1.48, 0.12);
  group.add(sidePane);

  // Iconic 2D Anime Diagonal Glass Gleam Streaks on Shopfront Windows
  const gleamMat = new THREE.MeshBasicMaterial({
    color: 0xdff5ff,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const addWindowGleam = (x, y, z, w, rotY = 0) => {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.85), gleamMat);
    g.position.set(x, y, z);
    g.rotation.y = rotY;
    g.rotation.z = -0.34;
    group.add(g);
  };
  addWindowGleam(-3.05, floorY + 1.52, 1.115, 0.22);
  addWindowGleam(-2.72, floorY + 1.52, 1.115, 0.09);
  addWindowGleam(1.22, floorY + 1.52, 1.115, 0.18);
  addWindowGleam(1.915, floorY + 1.52, 0.28, 0.20, Math.PI / 2);

  // Window Poster Decals (visible on outside of glass)
  const coffeePoster = new THREE.Mesh(
    new THREE.PlaneGeometry(0.55, 0.78),
    glowMat(0xffffff, { map: createWindowPosterTexture('coffee'), intensity: 0.76 })
  );
  coffeePoster.position.set(-3.72, floorY + 1.45, 1.125);
  group.add(coffeePoster);

  const onigiriPoster = new THREE.Mesh(
    new THREE.PlaneGeometry(0.55, 0.78),
    glowMat(0xffffff, { map: createWindowPosterTexture('onigiri'), intensity: 0.76 })
  );
  onigiriPoster.position.set(-2.0, floorY + 1.45, 1.125);
  group.add(onigiriPoster);

  const nikumanPoster = new THREE.Mesh(
    new THREE.PlaneGeometry(0.52, 0.74),
    glowMat(0xffffff, { map: createWindowPosterTexture('nikuman'), intensity: 0.76 })
  );
  nikumanPoster.position.set(1.12, floorY + 1.48, 1.125);
  group.add(nikumanPoster);

  const recruitPoster = new THREE.Mesh(
    new THREE.PlaneGeometry(0.52, 0.74),
    glowMat(0xffffff, { map: createWindowPosterTexture('recruit'), intensity: 0.74 })
  );
  recruitPoster.rotation.y = Math.PI / 2;
  recruitPoster.position.set(1.925, floorY + 1.5, 0.15);
  group.add(recruitPoster);

  // Automatic Sliding Glass Doors (自动门) at x: -1.37 to +0.25, recessed slightly at z = +0.96
  const doorHeaderFrame = createCelMesh(
    new THREE.BoxGeometry(1.84, 0.16, 0.24),
    frameDarkMat,
    { outline: 0, edges: true }
  );
  doorHeaderFrame.position.set(-0.56, floorY + 2.42, 1.02);
  group.add(doorHeaderFrame);

  // Infrared automatic door sensor box
  const sensorBox = createCelMesh(new THREE.BoxGeometry(0.36, 0.08, 0.12), celMat(0x161c2e), {
    outline: 0.008,
  });
  sensorBox.position.set(-0.56, floorY + 2.52, 1.14);
  group.add(sensorBox);

  // Tiny glowing green status LED on sensor
  const sensorLed = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.03, 0.02),
    glowMat(0x52ff9b, { intensity: 1.6 })
  );
  sensorLed.position.set(-0.56, floorY + 2.52, 1.205);
  group.add(sensorLed);

  // Two glass sliding door leaves (slightly cracked/parted or closed cleanly with teal safety stripe)
  [-0.98, -0.14].forEach((dx) => {
    const leafGroup = new THREE.Group();
    const leafGlass = new THREE.Mesh(new THREE.BoxGeometry(0.78, 2.28, 0.04), glassMat);
    leafGroup.add(leafGlass);

    // Metallic perimeter sash
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.08, 0.06), frameDarkMat);
    topRail.position.y = 1.11;
    const botRail = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.12, 0.06), frameDarkMat);
    botRail.position.y = -1.08;
    const leftStile = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.28, 0.06), frameDarkMat);
    leftStile.position.x = -0.375;
    const rightStile = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.28, 0.06), frameDarkMat);
    rightStile.position.x = 0.375;

    // Iconic horizontal teal & orange konbini glass safety decal stripe
    const safetyStripeTeal = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.06, 0.045),
      glowMat(0x28c7b8, { intensity: 0.9 })
    );
    safetyStripeTeal.position.y = -0.05;
    const safetyStripeOrange = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.035, 0.045),
      glowMat(0xff8959, { intensity: 0.9 })
    );
    safetyStripeOrange.position.y = -0.11;

    leafGroup.add(topRail, botRail, leftStile, rightStile, safetyStripeTeal, safetyStripeOrange);
    leafGroup.position.set(dx, floorY + 1.16, 0.98);
    group.add(leafGroup);
  });

  // Entrance Door Mat (门口地垫) right outside the automatic doors
  const doorMatMesh = createCelMesh(
    new THREE.BoxGeometry(1.55, 0.024, 0.82),
    celMat(0xffffff, { map: createDoorMatTexture(), rimStrength: 0.12 }),
    { outline: 0, edges: true, edgeOpacity: 0.55 }
  );
  doorMatMesh.position.set(-0.56, floorY + 0.012, 1.56);
  group.add(doorMatMesh);

  // --- 4. Overhanging Eaves / Rain Canopy (屋檐雨棚) & Glowing Fascia Signboard (便利店招牌) ---
  // L-shaped projecting canopy wrapping front (+Z) and right (+X) with zero overlap at corner
  const frontCanopy = createCelMesh(
    new THREE.BoxGeometry(7.26, 0.72, 1.18),
    celMat(0xf5f2e8, { rimStrength: 0.2 }),
    { outline: 0.016, edges: true, edgeOpacity: 0.65 }
  );
  frontCanopy.position.set(-0.92, floorY + 2.94, 1.72);
  group.add(frontCanopy);

  const sideCanopy = createCelMesh(
    new THREE.BoxGeometry(0.82, 0.72, 5.48),
    celMat(0xf5f2e8, { rimStrength: 0.2 }),
    { outline: 0.016, edges: true, edgeOpacity: 0.65 }
  );
  sideCanopy.position.set(2.30, floorY + 2.94, -1.61);
  group.add(sideCanopy);

  // Glowing Front Fascia Signboard (みどりマート)
  const frontSignTex = createKonbiniFasciaTexture();
  const frontFascia = new THREE.Mesh(
    new THREE.PlaneGeometry(7.16, 0.66),
    glowMat(0xffffff, { map: frontSignTex, intensity: 1.12 })
  );
  frontFascia.position.set(-0.92, floorY + 2.94, 2.318);
  group.add(frontFascia);

  // Glowing Right-Side Fascia Signboard (24時間営業) spanning cleanly across entire +X edge
  const sideSignTex = createKonbiniSideFasciaTexture();
  const sideFascia = new THREE.Mesh(
    new THREE.PlaneGeometry(6.54, 0.66),
    glowMat(0xffffff, { map: sideSignTex, intensity: 1.08 })
  );
  sideFascia.rotation.y = Math.PI / 2;
  sideFascia.position.set(2.718, floorY + 2.94, -1.02);
  group.add(sideFascia);

  // 3D Glowing Neon Trim Tubes framing top (teal) & bottom (warm orange) of wraparound canopy
  const neonTealMat = glowMat(0x2ef0dc, { intensity: 1.55 });
  const neonOrangeMat = glowMat(0xff8c56, { intensity: 1.45 });
  const frontTopTube = new THREE.Mesh(new THREE.BoxGeometry(7.28, 0.045, 0.045), neonTealMat);
  frontTopTube.position.set(-0.92, floorY + 3.29, 2.33);
  const frontBotTube = new THREE.Mesh(new THREE.BoxGeometry(7.28, 0.04, 0.04), neonOrangeMat);
  frontBotTube.position.set(-0.92, floorY + 2.59, 2.33);
  const sideTopTube = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 6.68), neonTealMat);
  sideTopTube.position.set(2.73, floorY + 3.29, -1.02);
  const sideBotTube = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 6.68), neonOrangeMat);
  sideBotTube.position.set(2.73, floorY + 2.59, -1.02);
  group.add(frontTopTube, frontBotTube, sideTopTube, sideBotTube);

  // Underside canopy soffit downlights (warm pools + soft anime halation sprites)
  const soffitLightMat = glowMat(0xffeacc, { intensity: 1.5 });
  [-3.2, -1.8, -0.56, 0.8, 2.25].forEach((lx) => {
    const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.22), soffitLightMat);
    bulb.position.set(lx, floorY + 2.57, 1.78);
    group.add(bulb);
    const halo = createGlowSprite(0xffdfb0, 1.15, 0.24);
    halo.position.set(lx, floorY + 2.50, 1.78);
    group.add(halo);
  });
  [0.4, -1.4, -3.1].forEach((lz) => {
    const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.42), soffitLightMat);
    bulb.position.set(2.35, floorY + 2.57, lz);
    group.add(bulb);
    const halo = createGlowSprite(0xffdfb0, 1.05, 0.22);
    halo.position.set(2.35, floorY + 2.50, lz);
    group.add(halo);
  });

  // --- 5. Rooftop Parapet, Rain Gutters & Downspouts (雨樋) ---
  const roofDeck = createCelMesh(
    new THREE.BoxGeometry(6.46, 0.22, 5.46),
    roofMat,
    { outline: 0, edges: true, edgeOpacity: 0.65 }
  );
  roofDeck.position.set(-1.2, floorY + 3.36, -1.5);
  group.add(roofDeck);

  // Parapet coping rim
  const parapetBack = createCelMesh(new THREE.BoxGeometry(6.48, 0.24, 0.18), roofMat, {
    outline: 0,
    edges: true,
  });
  parapetBack.position.set(-1.2, floorY + 3.55, -4.14);
  group.add(parapetBack);

  const parapetLeft = createCelMesh(new THREE.BoxGeometry(0.18, 0.24, 5.48), roofMat, {
    outline: 0,
    edges: true,
  });
  parapetLeft.position.set(-4.34, floorY + 3.55, -1.5);
  group.add(parapetLeft);

  // Rooftop HVAC duct & exhaust fan unit (adds crisp rooftop silhouette when orbiting high!)
  const roofHvac = createCelMesh(
    new THREE.BoxGeometry(1.45, 0.65, 1.05),
    celMat(0x6d7796, { rimStrength: 0.25 }),
    { outline: 0.015, edges: true }
  );
  roofHvac.position.set(-2.6, floorY + 3.78, -2.8);
  group.add(roofHvac);

  const roofVentCap = createCelMesh(
    new THREE.CylinderGeometry(0.26, 0.30, 0.38, 12),
    celMat(0x525c7a, { rimStrength: 0.25 }),
    { outline: 0.012 }
  );
  roofVentCap.position.set(-0.6, floorY + 3.65, -2.9);
  group.add(roofVentCap);

  // Vertical rain downspouts (雨樋) at front-left & rear-right building corners
  const makeDownspout = (x, z) => {
    const pipe = createCelMesh(
      new THREE.CylinderGeometry(0.045, 0.045, 3.05, 8),
      gutterMat,
      { outline: 0.01 }
    );
    pipe.position.set(x, floorY + 1.52, z);
    group.add(pipe);
    // Straps
    [0.7, 1.8, 2.7].forEach((sy) => {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.04, 0.11), frameDarkMat);
      strap.position.set(x, floorY + sy, z);
      group.add(strap);
    });
  };
  makeDownspout(-4.36, 1.24);
  makeDownspout(2.04, -4.12);

  // --- 6. Rear Service Door (勝手口) ---
  const backDoor = createCelMesh(
    new THREE.BoxGeometry(0.85, 1.98, 0.08),
    celMat(0x5a6584, { rimStrength: 0.2 }),
    { outline: 0, edges: true }
  );
  backDoor.position.set(-2.6, floorY + 0.99, -4.21);
  group.add(backDoor);

  const backDoorHood = createCelMesh(
    new THREE.BoxGeometry(1.12, 0.07, 0.42),
    gutterMat,
    { outline: 0.01, edges: true }
  );
  backDoorHood.position.set(-2.6, floorY + 2.08, -4.40);
  group.add(backDoorHood);

  const backDoorLamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.10, 0.10),
    glowMat(0xffd28c, { intensity: 1.3 })
  );
  backDoorLamp.position.set(-2.6, floorY + 2.18, -4.26);
  group.add(backDoorLamp);

  // --- 7. Rooftop Access Hatch & Exhaust Ducting ---
  const roofHatch = createCelMesh(
    new THREE.BoxGeometry(0.95, 0.34, 0.85),
    celMat(0x475273, { rimStrength: 0.24, wetness: 0.35 }),
    { outline: 0.012, edges: true }
  );
  roofHatch.position.set(0.65, floorY + 3.63, -2.6);
  group.add(roofHatch);

  // --- 8. Fluttering Japanese Konbini Nobori Banner Flag (のぼり旗) ---
  const noboriGroup = new THREE.Group();
  const waterBase = createCelMesh(
    new THREE.BoxGeometry(0.32, 0.24, 0.32),
    celMat(0x2878c9, { rimStrength: 0.25 }),
    { outline: 0.01, edges: true }
  );
  waterBase.position.y = 0.12;
  noboriGroup.add(waterBase);

  const flagPole = createCelMesh(
    new THREE.CylinderGeometry(0.016, 0.018, 2.05, 8),
    celMat(0xeef2fa),
    { outline: 0.006 }
  );
  flagPole.position.y = 1.08;
  noboriGroup.add(flagPole);

  const crossBar = createCelMesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.54, 8),
    celMat(0xeef2fa),
    { outline: 0.005 }
  );
  crossBar.rotation.z = Math.PI / 2;
  crossBar.position.set(0.25, 2.05, 0);
  noboriGroup.add(crossBar);

  const flagGeom = new THREE.PlaneGeometry(0.50, 1.36, 4, 8);
  const flagMat = celMat(0xffffff, {
    map: createNoboriTexture(),
    side: THREE.DoubleSide,
    rimStrength: 0.15,
  });
  const flagMesh = new THREE.Mesh(flagGeom, flagMat);
  flagMesh.position.set(0.26, 1.35, 0);
  noboriGroup.add(flagMesh);

  noboriGroup.position.set(-4.26, floorY, 2.05);
  noboriGroup.rotation.y = 0.32;
  group.add(noboriGroup);

  const flagBasePos = flagGeom.attributes.position.array.slice();

  return {
    group,
    fasciaMaterials: [frontFascia.material, sideFascia.material],
    update(elapsed) {
      const pos = flagGeom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const bx = flagBasePos[i * 3];
        const by = flagBasePos[i * 3 + 1];
        // Anchor left edge (bx = -0.25) & top edge (by = +0.68) to pole/crossbar
        const swayFactor = Math.max(0, (bx + 0.25) / 0.5) * Math.max(0, (0.68 - by) / 1.36);
        const wave = Math.sin(elapsed * 3.4 + by * 3.0 - bx * 4.0) * 0.055 * swayFactor;
        pos.setZ(i, wave);
      }
      pos.needsUpdate = true;
      flagGeom.computeVertexNormals();
    },
  };
}
