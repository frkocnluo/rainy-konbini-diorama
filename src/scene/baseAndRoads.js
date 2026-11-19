import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { celMat, addInkEdges, createCelMesh } from '../style/cel.js';
import {
  createTactileTileTexture,
  createWetAsphaltTexture,
  createSidewalkTileTexture,
  createGroundGlowTexture,
} from '../style/textures.js';

/**
 * Helper to create a rounded-corner 2D sidewalk shape in X-Z (drawn in X-Y then rotated -PI/2 around X).
 * Note: when Shape (x, y) is extruded along +Z and rotated -PI/2 on X:
 *   shape.x -> world X
 *   shape.y -> world -Z  (so worldZ = -shape.y)
 */
function buildSidewalkShape() {
  // Bounds in world space:
  // x: -8.0 to +3.82, z: -8.0 to +3.82
  // Corner radius at (+3.82, +3.82) -> r = 0.95
  // Exclude rear-right parking lot: x in [-0.35, +3.82], z in [-8.0, -4.25]
  // So in shape coordinates (sx = x, sy = -z):
  //   z = -8.0 => sy = +8.0
  //   z = -4.25 => sy = +4.25
  //   z = +3.82 => sy = -3.82
  const r = 0.95;
  const s = new THREE.Shape();
  s.moveTo(-8.0, 8.0);
  s.lineTo(-0.35, 8.0);
  s.lineTo(-0.35, 4.25);
  s.lineTo(3.82, 4.25);
  s.lineTo(3.82, -3.82 + r);
  s.absarc(3.82 - r, -3.82 + r, r, 0, -Math.PI / 2, true);
  s.lineTo(-8.0, -3.82);
  s.closePath();
  return s;
}

function createPuddleShape(cx, cy, rx, ry, lobes = 5, seed = 1) {
  const shape = new THREE.Shape();
  const pts = [];
  const steps = 28;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const wobble =
      1.0 +
      0.16 * Math.sin(a * lobes + seed * 2.1) +
      0.09 * Math.cos(a * (lobes + 2) - seed * 1.3);
    pts.push(new THREE.Vector2(cx + Math.cos(a) * rx * wobble, cy + Math.sin(a) * ry * wobble));
  }
  shape.moveTo(pts[0].x, pts[0].y);
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[(i + 1) % pts.length];
    const pMid = pts[i].clone().lerp(p1, 0.5);
    shape.quadraticCurveTo(pts[i].x, pts[i].y, pMid.x, pMid.y);
  }
  shape.closePath();
  return shape;
}

function createPuddleReflectorShader() {
  return {
    name: 'AnimeRainPuddleShader',
    uniforms: {
      color: { value: null },
      tDiffuse: { value: null },
      textureMatrix: { value: null },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform mat4 textureMatrix;
      varying vec4 vUv;
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vUv = textureMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 color;
      uniform sampler2D tDiffuse;
      uniform float uTime;
      varying vec4 vUv;
      varying vec3 vWorldPos;

      float rippleRing(vec2 p, vec2 center, float phase, float period) {
        float t = fract(uTime / period + phase);
        float d = length(p - center);
        float radius = t * 0.55;
        float ring = exp(-abs(d - radius) * 26.0) * (1.0 - t);
        return ring;
      }

      void main() {
        vec2 p = vWorldPos.xz;
        float r1 = rippleRing(p, vec2(1.4, 5.5), 0.12, 1.65);
        float r2 = rippleRing(p, vec2(-1.6, 5.9), 0.54, 1.9);
        float r3 = rippleRing(p, vec2(5.4, 1.2), 0.37, 1.75);
        float r4 = rippleRing(p, vec2(5.6, -2.1), 0.78, 2.05);
        float r5 = rippleRing(p, vec2(-3.6, 6.2), 0.25, 1.55);
        float r6 = rippleRing(p, vec2(3.1, 5.1), 0.68, 1.8);

        float ripple = r1 + r2 + r3 + r4 + r5 + r6;

        // Subtle animated wave distortion in reflection projection
        vec2 wave = vec2(
          sin(p.x * 8.0 + uTime * 3.2) + cos(p.y * 7.0 - uTime * 2.5),
          cos(p.x * 7.5 - uTime * 2.8) + sin(p.y * 8.5 + uTime * 3.0)
        ) * 0.008;

        vec4 projUv = vUv;
        projUv.xy += (wave + vec2(ripple * 0.045)) * projUv.w;

        vec4 refl = texture2DProj(tDiffuse, projUv);

        // Anime wet puddle: deep slate water base + crisp neon reflection + faint cyan ripple ring
        vec3 wetBase = vec3(0.06, 0.09, 0.19);
        vec3 col = mix(wetBase, refl.rgb * color * 1.45, 0.72);
        col += vec3(0.45, 0.68, 0.95) * ripple * 0.30;

        gl_FragColor = vec4(col, 0.84);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  };
}

export function buildBaseAndRoads() {
  const group = new THREE.Group();
  group.name = 'BaseAndRoads';

  // 1. Collectible Square Diorama Plinth (16 x 16)
  // Upper dark trough layer (y: -0.10 to -0.07) inside gutters, road sits at y = 0
  const plinthCore = createCelMesh(
    new THREE.BoxGeometry(16.0, 0.92, 16.0),
    celMat(0x202742, { rimStrength: 0.14, shadowTintStrength: 0.4 }),
    { outline: 0, edges: true, edgeAngle: 40, edgeOpacity: 0.7, castShadow: false, receiveShadow: true }
  );
  plinthCore.position.y = -0.53; // top at -0.07
  group.add(plinthCore);

  // Subtle decorative cut-away stratum band around the plinth
  const trimBand = createCelMesh(
    new THREE.BoxGeometry(16.1, 0.12, 16.1),
    celMat(0x2f395e, { rimStrength: 0.18 }),
    { outline: 0, edges: true, edgeAngle: 40, edgeOpacity: 0.65, castShadow: false, receiveShadow: true }
  );
  trimBand.position.y = -0.15;
  group.add(trimBand);

  // Bottom collectible pedestal base lip
  const pedestalFoot = createCelMesh(
    new THREE.BoxGeometry(16.45, 0.22, 16.45),
    celMat(0x14182b, { rimStrength: 0.16 }),
    { outline: 0.02, edges: true, edgeAngle: 40, edgeOpacity: 0.85, castShadow: true, receiveShadow: false }
  );
  pedestalFoot.position.y = -1.10;
  group.add(pedestalFoot);

  // Subtle collector-grade dark-gold hairline trim around the pedestal lip
  const goldTrim = new THREE.Mesh(
    new THREE.BoxGeometry(16.22, 0.03, 16.22),
    celMat(0x8e7c58, { rimStrength: 0.35 })
  );
  goldTrim.position.y = -0.97;
  group.add(goldTrim);

  // Dark wet water film in the recessed gutter trough (y = -0.068)
  const gutterWaterMat = celMat(0x131b33, { rimStrength: 0.38, wetness: 0.65, shadowTintStrength: 0.2 });
  const gutterWater = new THREE.Mesh(new THREE.PlaneGeometry(15.98, 15.98), gutterWaterMat);
  gutterWater.rotation.x = -Math.PI / 2;
  gutterWater.position.y = -0.068;
  gutterWater.receiveShadow = true;
  group.add(gutterWater);

  // 2. Wet Asphalt Road Slabs (y: -0.07 to 0.0)
  // Front street: x in [-8, 8], z in [4.14, 8.0]
  const asphaltTexFront = createWetAsphaltTexture(5, 1.5);
  const asphaltMatFront = celMat(0xd4dcf5, {
    map: asphaltTexFront,
    rimStrength: 0.14,
    wetness: 0.45,
    shadowTint: 0x11152b,
    shadowTintStrength: 0.42,
  });

  const asphaltTexRight = createWetAsphaltTexture(1.5, 4);
  const asphaltMatRight = celMat(0xd4dcf5, {
    map: asphaltTexRight,
    rimStrength: 0.14,
    wetness: 0.45,
    shadowTint: 0x11152b,
    shadowTintStrength: 0.42,
  });

  const frontRoad = createCelMesh(
    new THREE.BoxGeometry(16.0, 0.07, 3.86),
    asphaltMatFront,
    { outline: 0, edges: true, edgeAngle: 40, edgeOpacity: 0.55, castShadow: false, receiveShadow: true }
  );
  frontRoad.position.set(0, -0.035, 6.07);
  group.add(frontRoad);

  // Right street: x in [4.14, 8.0], z in [-8.0, 4.14]
  const rightRoad = createCelMesh(
    new THREE.BoxGeometry(3.86, 0.07, 12.14),
    asphaltMatRight,
    { outline: 0, edges: true, edgeAngle: 40, edgeOpacity: 0.55, castShadow: false, receiveShadow: true }
  );
  rightRoad.position.set(6.07, -0.035, -1.93);
  group.add(rightRoad);

  // Subtle dashed center-lane divider marks near outer road edges for street scale
  const laneMarkMat = celMat(0xcfd8f0, { rimStrength: 0.1 });
  for (let x = -6.8; x <= 6.8; x += 2.2) {
    if (x > -0.8 && x < 4.5) continue;
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.006, 0.11), laneMarkMat);
    dash.position.set(x, 0.003, 7.65);
    dash.receiveShadow = true;
    group.add(dash);
  }
  for (let z = -6.8; z <= 3.0; z += 2.2) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.006, 1.05), laneMarkMat);
    dash.position.set(7.65, 0.003, z);
    dash.receiveShadow = true;
    group.add(dash);
  }

  // 3. Raised Sidewalk (y: -0.07 to +0.16) with rounded street corner
  const sidewalkShape = buildSidewalkShape();
  const sidewalkGeom = new THREE.ExtrudeGeometry(sidewalkShape, {
    depth: 0.23,
    bevelEnabled: false,
    curveSegments: 16,
  });
  sidewalkGeom.rotateX(-Math.PI / 2);

  const sidewalkTex = createSidewalkTileTexture(0.35, 0.35);
  const sidewalkMat = celMat(0xe2e8f7, {
    map: sidewalkTex,
    rimStrength: 0.22,
    wetness: 0.32,
    shadowTint: 0x1c2342,
    shadowTintStrength: 0.42,
  });
  const sidewalk = createCelMesh(sidewalkGeom, sidewalkMat, {
    outline: 0,
    edges: true,
    edgeAngle: 35,
    edgeOpacity: 0.7,
    castShadow: true,
    receiveShadow: true,
  });
  sidewalk.position.y = -0.07;
  group.add(sidewalk);

  // Concrete Curb Top Trim (縁石) along street edges + rounded corner
  const curbMat = celMat(0x7c86a6, { rimStrength: 0.24 });
  const curbFront = createCelMesh(
    new THREE.BoxGeometry(10.87, 0.04, 0.16),
    curbMat,
    { outline: 0, edges: true, edgeAngle: 35, edgeOpacity: 0.55 }
  );
  curbFront.position.set(-2.565, 0.165, 3.74);
  group.add(curbFront);

  const curbRight = createCelMesh(
    new THREE.BoxGeometry(0.16, 0.04, 7.12),
    curbMat,
    { outline: 0, edges: true, edgeAngle: 35, edgeOpacity: 0.55 }
  );
  curbRight.position.set(3.74, 0.165, -0.69);
  group.add(curbRight);

  // Sidewalk paving joint score lines
  const jointMat = new THREE.LineBasicMaterial({ color: 0x29314d, transparent: true, opacity: 0.45 });
  const jointPts = [];
  for (let x = -7.0; x <= 3.0; x += 1.0) {
    jointPts.push(new THREE.Vector3(x, 0.162, 1.2), new THREE.Vector3(x, 0.162, 3.65));
  }
  for (let z = -4.0; z <= 3.0; z += 1.0) {
    jointPts.push(new THREE.Vector3(2.0, 0.162, z), new THREE.Vector3(3.65, 0.162, z));
  }
  const jointGeom = new THREE.BufferGeometry().setFromPoints(jointPts);
  group.add(new THREE.LineSegments(jointGeom, jointMat));

  // 4. Yellow Tactile Paving Tiles (点字ブロック) near corner & crosswalk approaches
  const tactileTex = createTactileTileTexture();
  const tactileMat = celMat(0xf0cd4f, { map: tactileTex, rimStrength: 0.12 });
  const tileSize = 0.34;
  // Front strip leading to crosswalk
  for (let x = -3.8; x <= 2.4; x += tileSize) {
    const tile = new THREE.Mesh(new THREE.BoxGeometry(tileSize - 0.015, 0.014, tileSize), tactileMat);
    tile.position.set(x, 0.166, 3.35);
    tile.receiveShadow = true;
    group.add(tile);
  }
  // Right strip leading to crosswalk
  for (let z = -2.2; z <= 2.9; z += tileSize) {
    const tile = new THREE.Mesh(new THREE.BoxGeometry(tileSize, 0.014, tileSize - 0.015), tactileMat);
    tile.position.set(3.35, 0.166, z);
    tile.receiveShadow = true;
    group.add(tile);
  }

  // 5. Drainage Grates (排水沟 / グレーチング) spanning the recessed gutter
  const grateFrameMat = celMat(0x3a435e, { rimStrength: 0.25 });
  const grateSlatsMat = celMat(0x1f2538, { rimStrength: 0.15 });
  const makeGrate = (x, z, rotY = 0) => {
    const g = new THREE.Group();
    const frame = createCelMesh(new THREE.BoxGeometry(0.95, 0.03, 0.30), grateFrameMat, {
      outline: 0,
      edges: true,
      edgeOpacity: 0.7,
    });
    g.add(frame);
    for (let sx = -0.38; sx <= 0.38; sx += 0.095) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.036, 0.24), grateSlatsMat);
      slat.position.x = sx;
      g.add(slat);
    }
    g.position.set(x, 0.005, z);
    g.rotation.y = rotY;
    return g;
  };

  [-6.2, -3.1, -0.3, 2.2].forEach((x) => group.add(makeGrate(x, 3.98, 0)));
  [-3.2, -0.5, 2.1].forEach((z) => group.add(makeGrate(3.98, z, Math.PI / 2)));

  // 6. Parking Space (停车位) at rear-right: x in [-0.35, 3.82], z in [-7.9, -4.25]
  const parkingPad = createCelMesh(
    new THREE.BoxGeometry(4.17, 0.09, 3.75),
    celMat(0x2e3654, { rimStrength: 0.14 }),
    { outline: 0, edges: true, edgeAngle: 40, edgeOpacity: 0.6 }
  );
  parkingPad.position.set(1.735, -0.025, -6.125);
  group.add(parkingPad);

  // Sloped curb driveway apron connecting parking lot to +X street over gutter
  const rampShape = new THREE.Shape();
  rampShape.moveTo(0, 0);
  rampShape.lineTo(0.36, -0.02);
  rampShape.lineTo(0.36, -0.09);
  rampShape.lineTo(0, -0.09);
  rampShape.closePath();
  const rampGeom = new THREE.ExtrudeGeometry(rampShape, { depth: 3.4, bevelEnabled: false });
  const ramp = createCelMesh(rampGeom, celMat(0x47506e, { rimStrength: 0.18 }), {
    outline: 0,
    edges: true,
  });
  ramp.position.set(3.81, 0.02, -7.8);
  group.add(ramp);

  // Parking bay white lines (2 stalls facing +X street)
  const paintWhiteMat = celMat(0xe6ecff, { rimStrength: 0.12 });
  const lineH = 0.008;
  // Horizontal stall dividers along X
  [-7.55, -5.98, -4.42].forEach((z) => {
    const line = new THREE.Mesh(new THREE.BoxGeometry(3.35, lineH, 0.08), paintWhiteMat);
    line.position.set(1.9, 0.023, z);
    line.receiveShadow = true;
    group.add(line);
  });
  // Back stop line
  const backLine = new THREE.Mesh(new THREE.BoxGeometry(0.08, lineH, 3.21), paintWhiteMat);
  backLine.position.set(0.24, 0.023, -5.985);
  group.add(backLine);

  // Painted "P" in parking stall
  const pGroup = new THREE.Group();
  const pStem = new THREE.Mesh(new THREE.BoxGeometry(0.45, lineH, 0.09), paintWhiteMat);
  const pTop = new THREE.Mesh(new THREE.BoxGeometry(0.09, lineH, 0.28), paintWhiteMat);
  pTop.position.set(0.18, 0, 0.12);
  const pBot = new THREE.Mesh(new THREE.BoxGeometry(0.09, lineH, 0.28), paintWhiteMat);
  pBot.position.set(-0.02, 0, 0.12);
  const pRight = new THREE.Mesh(new THREE.BoxGeometry(0.24, lineH, 0.09), paintWhiteMat);
  pRight.position.set(0.08, 0, 0.24);
  pGroup.add(pStem, pTop, pBot, pRight);
  pGroup.position.set(2.15, 0.024, -6.78);
  group.add(pGroup);

  // Concrete / Yellow-striped Wheel Stoppers (車止め)
  const stopperMat = celMat(0x8b94b2, { rimStrength: 0.2 });
  const yellowBandMat = celMat(0xf0c73c, { rimStrength: 0.15 });
  [-6.76, -5.20].forEach((z) => {
    [-0.4, 0.4].forEach((dz) => {
      const stop = createCelMesh(new THREE.BoxGeometry(0.16, 0.1, 0.44), stopperMat, {
        outline: 0.012,
      });
      stop.position.set(0.65, 0.07, z + dz);
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.045, 0.14), yellowBandMat);
      band.position.y = 0.02;
      stop.add(band);
      group.add(stop);
    });
  });

  // 7. Reflective Crosswalks (反光斑马线) & Stop Lines (停止線)
  const crosswalkMat = celMat(0xeef3ff, {
    rimStrength: 0.34,
    rimColor: 0xaad4ff,
    wetness: 0.55,
    shadowTint: 0x3b4875,
    shadowTintStrength: 0.28,
  });

  // Front road crosswalk (crossing Z at x = 0.6 .. 2.7)
  for (let i = 0; i < 6; i++) {
    const z = 4.55 + i * 0.60;
    const stripe = createCelMesh(new THREE.BoxGeometry(2.15, 0.01, 0.32), crosswalkMat, {
      outline: 0,
      edges: true,
      edgeOpacity: 0.35,
      castShadow: false,
    });
    stripe.position.set(1.65, 0.005, z);
    group.add(stripe);
  }
  // Front stop line
  const stopLineFront = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.01, 3.45), crosswalkMat);
  stopLineFront.position.set(-0.35, 0.005, 6.08);
  stopLineFront.receiveShadow = true;
  group.add(stopLineFront);

  // Right road crosswalk (crossing X at z = 0.6 .. 2.7)
  for (let i = 0; i < 6; i++) {
    const x = 4.55 + i * 0.60;
    const stripe = createCelMesh(new THREE.BoxGeometry(0.32, 0.01, 2.15), crosswalkMat, {
      outline: 0,
      edges: true,
      edgeOpacity: 0.35,
      castShadow: false,
    });
    stripe.position.set(x, 0.005, 1.65);
    group.add(stripe);
  }
  // Right stop line
  const stopLineRight = new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.01, 0.24), crosswalkMat);
  stopLineRight.position.set(6.08, 0.005, -0.35);
  stopLineRight.receiveShadow = true;
  group.add(stopLineRight);

  // 8. Real-Time Reflective Puddles (积水路面)
  // Note: ShapeGeometry is in X-Y; rotated -PI/2 around X -> shape (sx, sy) maps to world (sx, -sy).
  const puddleDefs = [
    { x: -1.5, z: 5.55, rx: 1.55, ry: 0.85, lobes: 4, seed: 1.2 },
    { x: 1.4, z: 5.45, rx: 1.25, ry: 0.72, lobes: 5, seed: 2.7 },
    { x: 5.45, z: 1.35, rx: 0.92, ry: 1.45, lobes: 4, seed: 4.1 },
    { x: 5.55, z: -2.15, rx: 0.85, ry: 1.25, lobes: 5, seed: 5.3 },
    { x: -4.4, z: 6.1, rx: 1.35, ry: 0.68, lobes: 4, seed: 3.4 },
    { x: 3.15, z: 4.85, rx: 0.95, ry: 0.55, lobes: 3, seed: 0.9 },
  ];

  const puddleShapes = puddleDefs.map((p) =>
    createPuddleShape(p.x, -p.z, p.rx, p.ry, p.lobes, p.seed)
  );
  const rimShapes = puddleDefs.map((p) =>
    createPuddleShape(p.x, -p.z, p.rx + 0.08, p.ry + 0.08, p.lobes, p.seed)
  );

  // Subtle dark wet-asphalt halo rim slightly below the reflector
  const wetRimGeom = new THREE.ShapeGeometry(rimShapes, 20);
  wetRimGeom.rotateX(-Math.PI / 2);
  const wetRim = new THREE.Mesh(
    wetRimGeom,
    new THREE.MeshBasicMaterial({ color: 0x11162a, transparent: true, opacity: 0.72 })
  );
  wetRim.position.y = 0.011;
  group.add(wetRim);

  // Planar real-time Reflector puddle surface (keep geometry in local XY; rotate mesh so Reflector normal = +Y)
  const puddleGeom = new THREE.ShapeGeometry(puddleShapes, 20);
  const puddleReflector = new Reflector(puddleGeom, {
    clipBias: 0.003,
    textureWidth: 1024,
    textureHeight: 1024,
    color: 0x8ea8e8,
    multisample: 2,
    shader: createPuddleReflectorShader(),
  });
  puddleReflector.rotation.x = -Math.PI / 2;
  puddleReflector.position.y = 0.014;
  puddleReflector.material.transparent = true;
  puddleReflector.material.depthWrite = false;
  group.add(puddleReflector);

  // Also a small puddle inside the left alley (on sidewalk height y = 0.165)
  const alleyPuddleShape = createPuddleShape(-5.3, 1.4, 0.52, 0.95, 4, 2.2);
  const alleyPuddleGeom = new THREE.ShapeGeometry(alleyPuddleShape, 18);
  alleyPuddleGeom.rotateX(-Math.PI / 2);
  const alleyPuddle = new THREE.Mesh(
    alleyPuddleGeom,
    celMat(0x283c66, { rimStrength: 0.65, rimColor: 0x80c8ff })
  );
  alleyPuddle.position.y = 0.165;
  addInkEdges(alleyPuddle, 60, 0x12182d, 0.6);
  group.add(alleyPuddle);

  // 9. Soft Wet-Ground Neon Reflection Sheen Pools (captures anime rainy-night color bounce)
  const addGroundSheen = (x, y, z, sx, sz, hex, opacity = 0.26) => {
    const tex = createGroundGlowTexture(hex);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    group.add(m);
  };
  // Warm golden-peach spill in front of konbini door & windows
  addGroundSheen(-0.9, 0.167, 2.25, 5.6, 2.5, '#ffd89a', 0.25);
  // Subtle teal & coral fascia bounce on front wet road
  addGroundSheen(-1.2, 0.017, 4.95, 5.2, 2.4, '#36c7bc', 0.16);
  // Cool cyan vending machine spill on right sidewalk & road
  addGroundSheen(3.25, 0.167, -2.1, 2.2, 2.8, '#6ce0ff', 0.28);
  addGroundSheen(5.1, 0.017, -2.0, 2.6, 3.0, '#6ce0ff', 0.16);
  // Warm amber streetlamp glow pool on corner crosswalk
  addGroundSheen(4.15, 0.017, 4.25, 4.8, 4.8, '#ffc775', 0.22);
  // Cozy warm orange spill inside the left alley entrance
  addGroundSheen(-5.25, 0.168, -0.5, 2.1, 2.8, '#ffae59', 0.24);

  return {
    group,
    update(elapsed) {
      if (puddleReflector.material?.uniforms?.uTime) {
        puddleReflector.material.uniforms.uTime.value = elapsed;
      }
    },
  };
}
