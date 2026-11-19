import * as THREE from 'three';
import { celMat, glowMat, createCelMesh, createGlowSprite } from '../style/cel.js';
import {
  createPylonSignTexture,
  createVendingTexture,
  createNoticeBoardTexture,
  createRoadSignTexture,
  createHazardBandTexture,
  createWindowPosterTexture,
} from '../style/textures.js';

const FLOOR_Y = 0.16;

function buildPylonSign() {
  const g = new THREE.Group();
  const metalMat = celMat(0x525d7d, { rimStrength: 0.25 });

  // Steel support post
  const post = createCelMesh(new THREE.CylinderGeometry(0.09, 0.11, 4.3, 12), metalMat, {
    outline: 0.015,
  });
  post.position.y = 2.15;
  g.add(post);

  // Concrete collar base
  const collar = createCelMesh(new THREE.CylinderGeometry(0.18, 0.21, 0.22, 12), celMat(0x6e7794), {
    outline: 0.012,
  });
  collar.position.y = 0.11;
  g.add(collar);

  // Double-sided illuminated vertical lightbox
  const cabinet = createCelMesh(
    new THREE.BoxGeometry(0.95, 2.05, 0.24),
    celMat(0xf4f1e8, { rimStrength: 0.2 }),
    { outline: 0.016, edges: true }
  );
  cabinet.position.y = 3.45;
  g.add(cabinet);

  const tex = createPylonSignTexture();
  const faceMat = glowMat(0xffffff, { map: tex, intensity: 1.15 });
  const frontFace = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 1.94), faceMat);
  frontFace.position.set(0, 3.45, 0.125);
  const backFace = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 1.94), faceMat);
  backFace.rotation.y = Math.PI;
  backFace.position.set(0, 3.45, -0.125);
  g.add(frontFace, backFace);

  return g;
}

function buildVendingMachine(variant = 'blue') {
  const g = new THREE.Group();
  const bodyColor = variant === 'blue' ? 0xdcebf7 : 0xf7e3dc;
  const body = createCelMesh(
    new THREE.BoxGeometry(0.52, 1.82, 0.76),
    celMat(bodyColor, { rimStrength: 0.22 }),
    { outline: 0.015, edges: true }
  );
  body.position.y = 0.91;
  g.add(body);

  // Side accent trim
  const accentColor = variant === 'blue' ? 0x268fe8 : 0xe35d42;
  const topCap = createCelMesh(new THREE.BoxGeometry(0.54, 0.09, 0.78), celMat(accentColor), {
    outline: 0.01,
  });
  topCap.position.y = 1.85;
  g.add(topCap);

  // Illuminated front display face (+X direction)
  const frontFace = new THREE.Mesh(
    new THREE.PlaneGeometry(0.70, 1.72),
    glowMat(0xffffff, { map: createVendingTexture(variant), intensity: 1.15 })
  );
  frontFace.rotation.y = Math.PI / 2;
  frontFace.position.set(0.264, 0.91, 0);
  g.add(frontFace);

  return g;
}

function buildRecyclingBins() {
  const g = new THREE.Group();
  const cabinetMat = celMat(0xe2e6ee, { rimStrength: 0.2 });
  const darkSlotMat = celMat(0x1b2236);

  // Dual Japanese konbini trash & bottle recycling bin
  const body = createCelMesh(new THREE.BoxGeometry(0.42, 0.86, 0.88), cabinetMat, {
    outline: 0.014,
    edges: true,
  });
  body.position.y = 0.43;
  g.add(body);

  // Color-coded sloped hoods (teal for cans/bottles, coral for burnables)
  const hood1 = createCelMesh(new THREE.BoxGeometry(0.44, 0.22, 0.42), celMat(0x229c91), {
    outline: 0.012,
    edges: true,
  });
  hood1.position.set(0, 0.94, -0.22);
  g.add(hood1);

  const hood2 = createCelMesh(new THREE.BoxGeometry(0.44, 0.22, 0.42), celMat(0xe0694a), {
    outline: 0.012,
    edges: true,
  });
  hood2.position.set(0, 0.94, 0.22);
  g.add(hood2);

  // Circular bottle holes + rectangular trash slot facing +X
  [-0.3, -0.14].forEach((hz) => {
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 12), darkSlotMat);
    hole.rotation.z = Math.PI / 2;
    hole.position.set(0.21, 0.93, hz);
    g.add(hole);
  });
  const rectSlot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.26), darkSlotMat);
  rectSlot.position.set(0.21, 0.93, 0.22);
  g.add(rectSlot);

  return g;
}

function buildUmbrellaStand() {
  const g = new THREE.Group();
  const metalMat = celMat(0x6d7899, { rimStrength: 0.25 });

  // Tray & upper ring frame
  const tray = createCelMesh(new THREE.BoxGeometry(0.46, 0.06, 0.24), celMat(0x3a435e), {
    outline: 0.01,
    edges: true,
  });
  tray.position.y = 0.03;
  g.add(tray);

  const topFrame = createCelMesh(new THREE.BoxGeometry(0.46, 0.035, 0.24), metalMat, {
    outline: 0.008,
  });
  topFrame.position.y = 0.50;
  g.add(topFrame);

  [
    [-0.21, -0.10],
    [0.21, -0.10],
    [-0.21, 0.10],
    [0.21, 0.10],
  ].forEach(([px, pz]) => {
    const leg = createCelMesh(new THREE.CylinderGeometry(0.014, 0.014, 0.50, 8), metalMat, {
      outline: 0.006,
    });
    leg.position.set(px, 0.25, pz);
    g.add(leg);
  });

  // 4 miniature Japanese umbrellas (clear vinyl + pastel anime hues)
  const umbrellas = [
    { x: -0.14, z: -0.02, tiltX: 0.12, tiltZ: 0.08, color: 0xe6f6ff, clear: true },
    { x: -0.03, z: 0.03, tiltX: -0.08, tiltZ: 0.05, color: 0xff7b66, clear: false },
    { x: 0.08, z: -0.03, tiltX: 0.09, tiltZ: -0.10, color: 0x4fb8f0, clear: false },
    { x: 0.16, z: 0.02, tiltX: -0.06, tiltZ: -0.06, color: 0xeaf8ff, clear: true },
  ];
  umbrellas.forEach((u) => {
    const ug = new THREE.Group();
    const fabricMat = u.clear
      ? celMat(u.color, { transparent: true, opacity: 0.72, rimStrength: 0.45 })
      : celMat(u.color, { rimStrength: 0.25 });
    const cone = createCelMesh(new THREE.ConeGeometry(0.048, 0.56, 8), fabricMat, {
      outline: 0.008,
    });
    cone.rotation.x = Math.PI;
    cone.position.y = 0.34;
    ug.add(cone);

    // Shaft + curved J-handle
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.72, 6), metalMat);
    shaft.position.y = 0.38;
    ug.add(shaft);

    const handle = createCelMesh(
      new THREE.TorusGeometry(0.032, 0.011, 6, 10, Math.PI),
      celMat(u.clear ? 0xf2f4f8 : 0x2d354d),
      { outline: 0.006 }
    );
    handle.position.set(0.032, 0.74, 0);
    ug.add(handle);

    ug.position.set(u.x, 0.04, u.z);
    ug.rotation.set(u.tiltX, 0, u.tiltZ);
    g.add(ug);
  });

  return g;
}

function buildBicycle() {
  const g = new THREE.Group();
  const frameMat = celMat(0x52b69a, { rimStrength: 0.28 }); // Pastel mint mamachari frame
  const tireMat = celMat(0x21273b, { rimStrength: 0.2 });
  const chromeMat = celMat(0xb8c4de, { rimStrength: 0.3 });
  const saddleMat = celMat(0x4f3a32, { rimStrength: 0.2 });

  const makeWheel = (x) => {
    const wg = new THREE.Group();
    const tire = createCelMesh(new THREE.TorusGeometry(0.28, 0.028, 8, 20), tireMat, {
      outline: 0.01,
    });
    wg.add(tire);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.012, 6, 20), chromeMat);
    wg.add(rim);
    for (let i = 0; i < 6; i++) {
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.49, 4), chromeMat);
      spoke.rotation.z = (i / 6) * Math.PI;
      wg.add(spoke);
    }
    wg.position.set(x, 0.30, 0);
    return wg;
  };

  g.add(makeWheel(-0.46), makeWheel(0.46));

  const addTube = (p1, p2, r = 0.018, mat = frameMat) => {
    const a = new THREE.Vector3(...p1);
    const b = new THREE.Vector3(...p2);
    const len = a.distanceTo(b);
    const cyl = createCelMesh(new THREE.CylinderGeometry(r, r, len, 8), mat, { outline: 0.007 });
    cyl.position.copy(a).lerp(b, 0.5);
    cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    g.add(cyl);
  };

  // Classic step-through mamachari frame
  addTube([-0.46, 0.30, 0], [-0.08, 0.30, 0], 0.016);
  addTube([-0.46, 0.30, 0], [-0.14, 0.64, 0], 0.016);
  addTube([-0.08, 0.30, 0], [-0.17, 0.74, 0], 0.018);
  addTube([-0.08, 0.30, 0], [0.34, 0.68, 0], 0.019);
  addTube([0.46, 0.30, 0], [0.32, 0.85, 0], 0.018);

  // Handlebars
  addTube([0.32, 0.85, -0.18], [0.32, 0.85, 0.18], 0.014, chromeMat);
  // Saddle
  const saddle = createCelMesh(new THREE.BoxGeometry(0.18, 0.06, 0.12), saddleMat, {
    outline: 0.008,
  });
  saddle.position.set(-0.18, 0.77, 0);
  g.add(saddle);

  // Front wire basket (前カゴ)
  const basket = createCelMesh(
    new THREE.BoxGeometry(0.22, 0.18, 0.26),
    celMat(0x4b5575, { rimStrength: 0.25 }),
    { outline: 0.008, edges: true }
  );
  basket.position.set(0.45, 0.68, 0);
  g.add(basket);

  // Rear luggage rack & kickstand
  const rack = createCelMesh(new THREE.BoxGeometry(0.32, 0.03, 0.16), chromeMat, {
    outline: 0.006,
  });
  rack.position.set(-0.44, 0.62, 0);
  g.add(rack);
  addTube([-0.42, 0.30, 0.04], [-0.52, 0.02, 0.10], 0.01, chromeMat);

  return g;
}

function buildStreetlamp() {
  const g = new THREE.Group();
  const poleMat = celMat(0x3a435e, { rimStrength: 0.26 });

  const basePedestal = createCelMesh(new THREE.CylinderGeometry(0.11, 0.14, 0.35, 10), poleMat, {
    outline: 0.012,
  });
  basePedestal.position.y = 0.175;
  g.add(basePedestal);

  const mainPole = createCelMesh(new THREE.CylinderGeometry(0.055, 0.08, 4.1, 10), poleMat, {
    outline: 0.012,
  });
  mainPole.position.y = 2.2;
  g.add(mainPole);

  // Curved gooseneck arm extending outward along +X
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 4.2, 0),
    new THREE.Vector3(0.25, 4.65, 0),
    new THREE.Vector3(0.85, 4.78, 0),
    new THREE.Vector3(1.25, 4.66, 0),
  ]);
  const armGeom = new THREE.TubeGeometry(curve, 14, 0.042, 8, false);
  const arm = createCelMesh(armGeom, poleMat, { outline: 0.01 });
  g.add(arm);

  // Lamp housing hood + glowing warm amber LED diffuser
  const hood = createCelMesh(new THREE.BoxGeometry(0.42, 0.10, 0.24), poleMat, {
    outline: 0.01,
    edges: true,
  });
  hood.position.set(1.36, 4.64, 0);
  hood.rotation.z = -0.14;
  g.add(hood);

  const lens = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.06, 0.18),
    glowMat(0xffd796, { intensity: 1.75 })
  );
  lens.position.set(1.36, 4.58, 0);
  lens.rotation.z = -0.14;
  g.add(lens);

  // Soft anime warm halation halo around streetlamp bulb
  const lampHalo = createGlowSprite(0xffd48f, 2.2, 0.55);
  lampHalo.position.set(1.38, 4.52, 0);
  g.add(lampHalo);

  // Volumetric anime rain-mist light cone beneath streetlamp
  const coneMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(0xffcf82) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        // Fade softly from lamp top (vUv.y = 1) down to street (vUv.y = 0)
        float vertical = pow(vUv.y, 1.45) * smoothstep(0.0, 0.25, vUv.y);
        float edge = pow(abs(dot(normalize(vNormal), normalize(vViewDir))), 1.35);
        float alpha = vertical * edge * 0.20;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  });
  const coneGeom = new THREE.CylinderGeometry(0.18, 2.35, 4.45, 24, 1, true);
  const lightCone = new THREE.Mesh(coneGeom, coneMat);
  lightCone.position.set(1.38, 2.32, 0);
  lightCone.raycast = () => {};
  g.add(lightCone);

  return g;
}

function buildGuardrail(length) {
  const g = new THREE.Group();
  const railWhiteMat = celMat(0xeef2fa, { rimStrength: 0.25 });

  // Vertical posts
  const postCount = Math.max(2, Math.round(length / 1.15) + 1);
  for (let i = 0; i < postCount; i++) {
    const x = -length / 2 + (i / (postCount - 1)) * length;
    const post = createCelMesh(new THREE.CylinderGeometry(0.032, 0.032, 0.68, 8), railWhiteMat, {
      outline: 0.01,
    });
    post.position.set(x, 0.34, 0);
    g.add(post);
  }

  // Horizontal upper & lower guard bars
  [0.62, 0.34].forEach((ry) => {
    const bar = createCelMesh(new THREE.CylinderGeometry(0.026, 0.026, length, 8), railWhiteMat, {
      outline: 0.01,
    });
    bar.rotation.z = Math.PI / 2;
    bar.position.y = ry;
    g.add(bar);
  });

  return g;
}

function buildRoadSign(type = 'stop') {
  const g = new THREE.Group();
  const poleMat = celMat(0x7682a1, { rimStrength: 0.22 });

  const pole = createCelMesh(new THREE.CylinderGeometry(0.028, 0.032, 2.35, 8), poleMat, {
    outline: 0.01,
  });
  pole.position.y = 1.175;
  g.add(pole);

  const tex = createRoadSignTexture(type);
  const plateMat = celMat(0xffffff, {
    map: tex,
    transparent: type === 'stop',
    side: THREE.DoubleSide,
    rimStrength: 0.15,
  });

  if (type === 'stop') {
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.58), plateMat);
    plate.position.set(0, 2.15, 0.033);
    const backShape = new THREE.Shape();
    backShape.moveTo(-0.24, 0.20);
    backShape.lineTo(0.24, 0.20);
    backShape.lineTo(0, -0.22);
    backShape.closePath();
    const backPlate = createCelMesh(
      new THREE.ExtrudeGeometry(backShape, { depth: 0.018, bevelEnabled: false }),
      poleMat,
      { outline: 0.008 }
    );
    backPlate.position.set(0, 2.16, 0.012);
    g.add(plate, backPlate);
  } else {
    const plate = createCelMesh(new THREE.BoxGeometry(0.48, 0.48, 0.03), plateMat, {
      outline: 0.01,
    });
    plate.position.set(0, 2.18, 0.02);
    g.add(plate);
  }

  return g;
}

function buildNoticeBoard() {
  const g = new THREE.Group();
  const woodMat = celMat(0x634b3c, { rimStrength: 0.2 });
  const roofMat = celMat(0x2f544c, { rimStrength: 0.25 });

  // Twin support legs
  [-0.52, 0.52].forEach((lx) => {
    const post = createCelMesh(new THREE.BoxGeometry(0.08, 1.48, 0.08), woodMat, {
      outline: 0.01,
    });
    post.position.set(lx, 0.74, 0);
    g.add(post);
  });

  // Main board box
  const board = createCelMesh(new THREE.BoxGeometry(1.16, 0.80, 0.09), woodMat, {
    outline: 0.012,
    edges: true,
  });
  board.position.set(0, 1.12, 0);
  g.add(board);

  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(1.06, 0.72),
    celMat(0xffffff, { map: createNoticeBoardTexture(), rimStrength: 0.1 })
  );
  face.position.set(0, 1.12, 0.048);
  g.add(face);

  // Cute pitched miniature rain roof cap
  const cap = createCelMesh(new THREE.BoxGeometry(1.32, 0.07, 0.34), roofMat, {
    outline: 0.012,
    edges: true,
  });
  cap.position.set(0, 1.56, 0.02);
  cap.rotation.x = 0.14;
  g.add(cap);

  return g;
}

function buildPosterAFrame() {
  const g = new THREE.Group();
  const frameMat = celMat(0x2d354d, { rimStrength: 0.2 });
  const posterMat = glowMat(0xffffff, { map: createWindowPosterTexture('onigiri'), intensity: 0.76 });

  const frontBoard = createCelMesh(new THREE.BoxGeometry(0.46, 0.72, 0.04), frameMat, {
    outline: 0.01,
    edges: true,
  });
  frontBoard.position.set(0, 0.38, 0.12);
  frontBoard.rotation.x = -0.22;
  const frontPoster = new THREE.Mesh(new THREE.PlaneGeometry(0.39, 0.62), posterMat);
  frontPoster.position.set(0, 0, 0.023);
  frontBoard.add(frontPoster);

  const backBoard = createCelMesh(new THREE.BoxGeometry(0.46, 0.72, 0.04), frameMat, {
    outline: 0.01,
    edges: true,
  });
  backBoard.position.set(0, 0.38, -0.12);
  backBoard.rotation.x = 0.22;

  g.add(frontBoard, backBoard);
  return g;
}

function buildUtilityPole(isMain = true, lowerArmRotY = 0) {
  const g = new THREE.Group();
  const concreteMat = celMat(0x7c8399, { rimStrength: 0.22 });
  const steelMat = celMat(0x424c6b, { rimStrength: 0.24 });
  const height = isMain ? 6.2 : 5.8;

  const pole = createCelMesh(new THREE.CylinderGeometry(0.10, 0.16, height, 10), concreteMat, {
    outline: 0.015,
  });
  pole.position.y = height / 2;
  g.add(pole);

  if (isMain) {
    // Yellow/black hazard reflector band (注意帯)
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.148, 0.155, 0.56, 10),
      celMat(0xffffff, { map: createHazardBandTexture(), rimStrength: 0.15 })
    );
    band.position.y = 1.25;
    g.add(band);

    // Street address plate (桜ヶ丘二丁目14)
    const addr = createCelMesh(
      new THREE.BoxGeometry(0.16, 0.52, 0.04),
      celMat(0xffffff, { map: createRoadSignTexture('address') }),
      { outline: 0.008 }
    );
    addr.position.set(0, 2.15, 0.14);
    g.add(addr);

    // Pole-mounted cylindrical transformer drum (変圧器)
    const drum = createCelMesh(new THREE.CylinderGeometry(0.24, 0.24, 0.62, 12), celMat(0x525d7d), {
      outline: 0.014,
    });
    drum.position.set(0.32, 4.35, 0);
    g.add(drum);

    // Small climbing bolts
    for (let y = 2.6; y < 5.0; y += 0.42) {
      const side = Math.round(y * 10) % 2 === 0 ? 1 : -1;
      const peg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.025), steelMat);
      peg.position.set(side * 0.14, y, 0);
      g.add(peg);
    }
  }

  // Twin steel crossarms + ceramic insulators at top
  [
    { cy: height - 0.35, ry: 0 },
    { cy: height - 0.90, ry: lowerArmRotY },
  ].forEach(({ cy, ry }) => {
    const armGroup = new THREE.Group();
    const arm = createCelMesh(new THREE.BoxGeometry(1.35, 0.07, 0.07), steelMat, {
      outline: 0.01,
    });
    armGroup.add(arm);

    [-0.56, 0, 0.56].forEach((ix) => {
      const ins = createCelMesh(
        new THREE.CylinderGeometry(0.032, 0.04, 0.11, 8),
        celMat(0xd6e6f5),
        { outline: 0.006 }
      );
      ins.position.set(ix, 0.08, 0);
      armGroup.add(ins);
    });
    armGroup.position.y = cy;
    armGroup.rotation.y = ry;
    g.add(armGroup);
  });

  return g;
}

function addPowerWire(parent, p1, p2, sag = 0.45, radius = 0.014) {
  const a = new THREE.Vector3(...p1);
  const b = new THREE.Vector3(...p2);
  const mid = a.clone().lerp(b, 0.5);
  mid.y -= sag;
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  const geom = new THREE.TubeGeometry(curve, 18, radius, 5, false);
  const wire = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ color: 0x111526 }));
  parent.add(wire);
}

export function buildStreetProps() {
  const group = new THREE.Group();
  group.name = 'StreetProps';

  // 1. Tall Freestanding Konbini Pylon Sign (便利店招牌)
  const pylon = buildPylonSign();
  pylon.position.set(3.22, FLOOR_Y, -4.02);
  pylon.rotation.y = Math.PI * 0.15;
  group.add(pylon);

  // 2. Twin Vending Machines (自动贩卖机) along right konbini wall
  const vmBlue = buildVendingMachine('blue');
  vmBlue.position.set(2.28, FLOOR_Y, -1.65);
  group.add(vmBlue);

  const vmWarm = buildVendingMachine('warm');
  vmWarm.position.set(2.28, FLOOR_Y, -2.50);
  group.add(vmWarm);

  // 3. Outdoor Recycling / Trash Bins (垃圾桶)
  const bins = buildRecyclingBins();
  bins.position.set(2.24, FLOOR_Y, -3.42);
  group.add(bins);

  // 4. Umbrella Stand (雨伞架) right next to automatic door
  const umbrellaStand = buildUmbrellaStand();
  umbrellaStand.position.set(0.45, FLOOR_Y, 1.44);
  group.add(umbrellaStand);

  // 5. Mamachari Bicycle (自行车) parked under front-left eaves
  const bike = buildBicycle();
  bike.position.set(-3.25, FLOOR_Y, 1.78);
  bike.rotation.y = 0.24;
  group.add(bike);

  // 6. Curved Streetlamp (路灯) at the rounded street corner
  const streetlamp = buildStreetlamp();
  streetlamp.position.set(3.32, FLOOR_Y, 3.22);
  streetlamp.rotation.y = -Math.PI * 0.25;
  group.add(streetlamp);

  // 7. Street Corner Pedestrian Guardrails (街角护栏)
  const frontRail = buildGuardrail(3.95);
  frontRail.position.set(-2.05, FLOOR_Y, 3.55);
  group.add(frontRail);

  const rightRail = buildGuardrail(3.35);
  rightRail.rotation.y = Math.PI / 2;
  rightRail.position.set(3.55, FLOOR_Y, -1.80);
  group.add(rightRail);

  // 8. Road Signs (路牌): 止まれ + 横断歩道
  const stopSign = buildRoadSign('stop');
  stopSign.position.set(0.22, FLOOR_Y, 3.45);
  stopSign.rotation.y = 0.15;
  group.add(stopSign);

  const crosswalkSign = buildRoadSign('crosswalk');
  crosswalkSign.position.set(3.45, FLOOR_Y, 0.22);
  crosswalkSign.rotation.y = Math.PI / 2 - 0.15;
  group.add(crosswalkSign);

  // 9. Community Notice Board (小型公告栏) & Storefront A-frame Poster Stand (海报栏)
  const noticeBoard = buildNoticeBoard();
  noticeBoard.position.set(-6.95, FLOOR_Y, 1.56);
  group.add(noticeBoard);

  const aFrame = buildPosterAFrame();
  aFrame.position.set(1.38, FLOOR_Y, 1.66);
  aFrame.rotation.y = -0.35;
  group.add(aFrame);

  // 10. Concrete Utility Poles (电线杆) & Catenary Power Lines (电线)
  const poleMain = buildUtilityPole(true, 0);
  poleMain.position.set(-7.20, FLOOR_Y, 3.22);
  group.add(poleMain);

  const poleBackLeft = buildUtilityPole(false, Math.PI / 2);
  poleBackLeft.position.set(-7.30, FLOOR_Y, -7.10);
  group.add(poleBackLeft);

  const poleBackRight = buildUtilityPole(false, Math.PI / 2);
  poleBackRight.position.set(3.40, FLOOR_Y, -7.35);
  group.add(poleBackRight);

  // Power lines spanning cleanly inside the square base
  // Main front-left pole -> back-left pole (top crossarm insulators aligned along X)
  [-0.56, 0, 0.56].forEach((offset, idx) => {
    addPowerWire(
      group,
      [-7.20 + offset, FLOOR_Y + 5.95, 3.22],
      [-7.30 + offset, FLOOR_Y + 5.55, -7.10],
      0.52 + idx * 0.05
    );
  });
  // Back-left pole -> back-right pole (lower crossarm insulators aligned along Z)
  [-0.56, 0, 0.56].forEach((offset, idx) => {
    addPowerWire(
      group,
      [-7.30, FLOOR_Y + 5.0, -7.10 + offset],
      [3.40, FLOOR_Y + 5.0, -7.35 + offset],
      0.58 + idx * 0.06
    );
  });
  // Overhead service drop wire from main utility pole into konbini roof bracket
  addPowerWire(group, [-7.20, FLOOR_Y + 5.4, 3.22], [-4.25, FLOOR_Y + 3.45, 0.4], 0.32, 0.012);
  addPowerWire(group, [-7.20, FLOOR_Y + 5.32, 3.22], [-4.25, FLOOR_Y + 3.40, 0.35], 0.35, 0.011);

  // Pole-mounted neighborhood security light (防犯灯) & overhead cable splice box (クロージャ)
  const secArm = createCelMesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.72, 8),
    celMat(0x525d7d),
    { outline: 0.008 }
  );
  secArm.rotation.z = -Math.PI / 3;
  secArm.position.set(-6.90, FLOOR_Y + 4.08, 3.22);
  group.add(secArm);

  const secLamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.08, 0.14),
    glowMat(0xd6f2ff, { intensity: 1.65 })
  );
  secLamp.position.set(-6.58, FLOOR_Y + 4.24, 3.22);
  group.add(secLamp);

  const secHalo = createGlowSprite(0x9ee0ff, 1.35, 0.42);
  secHalo.position.set(-6.58, FLOOR_Y + 4.20, 3.22);
  group.add(secHalo);

  const spliceBox = createCelMesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.42, 10),
    celMat(0x1f253a),
    { outline: 0.01 }
  );
  spliceBox.rotation.x = Math.PI / 2;
  spliceBox.position.set(-7.25, FLOOR_Y + 5.26, -1.9);
  group.add(spliceBox);

  // 11. Iconic Japanese Convex Street Corner Mirror (カーブミラー)
  const mirrorGroup = new THREE.Group();
  const mPole = createCelMesh(
    new THREE.CylinderGeometry(0.042, 0.046, 2.75, 10),
    celMat(0xe8a825, { rimStrength: 0.25 }),
    { outline: 0.01 }
  );
  mPole.position.y = 1.375;
  mirrorGroup.add(mPole);

  // Bright orange curved hood + round convex mirror disc
  const mHood = createCelMesh(
    new THREE.CylinderGeometry(0.36, 0.36, 0.12, 18),
    celMat(0xf06529, { rimStrength: 0.28 }),
    { outline: 0.012 }
  );
  mHood.rotation.x = Math.PI / 2;
  mHood.position.set(0, 2.68, 0.02);
  mirrorGroup.add(mHood);

  const mGlass = new THREE.Mesh(
    new THREE.SphereGeometry(0.31, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.35),
    celMat(0xcde6ff, { rimStrength: 0.65, rimColor: 0xffffff, wetness: 0.9 })
  );
  mGlass.rotation.x = Math.PI / 2;
  mGlass.position.set(0, 2.68, 0.01);
  mirrorGroup.add(mGlass);

  mirrorGroup.position.set(-4.35, FLOOR_Y, 3.48);
  mirrorGroup.rotation.y = 0.58;
  group.add(mirrorGroup);

  // 12. Rain-Wet Hydrangea Stone Planter (紫陽花 / アジサイ) beside alley wall & notice board
  const planterGroup = new THREE.Group();
  const stoneBox = createCelMesh(
    new THREE.BoxGeometry(0.95, 0.34, 0.52),
    celMat(0x6b748f, { rimStrength: 0.2, wetness: 0.3 }),
    { outline: 0.012, edges: true }
  );
  stoneBox.position.y = 0.17;
  planterGroup.add(stoneBox);

  const soil = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.06, 0.42), celMat(0x2d2424));
  soil.position.y = 0.33;
  planterGroup.add(soil);

  const leafMat = celMat(0x286b60, { rimStrength: 0.28, wetness: 0.45 });
  const leafCoords = [
    [-0.28, 0.48, 0.04, 0.22],
    [0.0, 0.52, -0.04, 0.26],
    [0.26, 0.47, 0.05, 0.22],
    [-0.14, 0.44, -0.10, 0.20],
    [0.16, 0.45, -0.09, 0.19],
  ];
  leafCoords.forEach(([lx, ly, lz, r]) => {
    const bush = createCelMesh(new THREE.DodecahedronGeometry(r, 1), leafMat, {
      outline: 0.01,
    });
    bush.position.set(lx, ly, lz);
    planterGroup.add(bush);
  });

  // Pastel blue, periwinkle & lavender hydrangea blossoms (梅雨の紫陽花)
  const blossomData = [
    [-0.25, 0.68, 0.06, 0.125, 0x7cb8ff],
    [0.02, 0.75, 0.01, 0.14, 0x9aa4ff],
    [0.24, 0.66, 0.08, 0.12, 0x6cd4e8],
    [-0.08, 0.63, -0.10, 0.11, 0xc29cff],
    [0.14, 0.62, -0.08, 0.105, 0x7cb8ff],
  ];
  blossomData.forEach(([bx, by, bz, r, col]) => {
    const fl = createCelMesh(
      new THREE.IcosahedronGeometry(r, 1),
      celMat(col, { rimStrength: 0.38, rimColor: 0xe6f2ff, wetness: 0.4 }),
      { outline: 0.009 }
    );
    fl.position.set(bx, by, bz);
    planterGroup.add(fl);
  });
  planterGroup.position.set(-6.95, FLOOR_Y, 2.24);
  group.add(planterGroup);

  // 13. Cute Retro Japanese Scooter / Moped (原付スクーター) parked in parking stall #2
  const scooter = new THREE.Group();
  const bodyPastelMat = celMat(0x7cc8e8, { rimStrength: 0.34, wetness: 0.6 });
  const creamMat = celMat(0xf5efe2, { rimStrength: 0.28, wetness: 0.5 });
  const tireMat = celMat(0x1f2538, { rimStrength: 0.22 });
  const seatMat = celMat(0x5c3e32, { rimStrength: 0.22 });
  const chromeMat = celMat(0xc4d0e6, { rimStrength: 0.35 });

  [-0.50, 0.48].forEach((wx) => {
    const wheel = createCelMesh(new THREE.TorusGeometry(0.20, 0.055, 8, 18), tireMat, {
      outline: 0.01,
    });
    wheel.position.set(wx, 0.24, 0);
    scooter.add(wheel);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 12), chromeMat);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(wx, 0.24, 0);
    scooter.add(hub);
  });

  // Floorboard, rear cowling & front leg shield
  const deck = createCelMesh(new THREE.BoxGeometry(0.74, 0.09, 0.36), creamMat, {
    outline: 0.01,
  });
  deck.position.set(-0.02, 0.26, 0);
  scooter.add(deck);

  const rearBody = createCelMesh(new THREE.BoxGeometry(0.68, 0.34, 0.38), bodyPastelMat, {
    outline: 0.012,
    edges: true,
  });
  rearBody.position.set(-0.34, 0.48, 0);
  scooter.add(rearBody);

  const seat = createCelMesh(new THREE.BoxGeometry(0.54, 0.12, 0.30), seatMat, {
    outline: 0.01,
  });
  seat.position.set(-0.28, 0.69, 0);
  scooter.add(seat);

  const frontShield = createCelMesh(new THREE.BoxGeometry(0.18, 0.66, 0.38), creamMat, {
    outline: 0.012,
    edges: true,
  });
  frontShield.position.set(0.36, 0.58, 0);
  frontShield.rotation.z = 0.20;
  scooter.add(frontShield);

  const handlebar = createCelMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.56, 8), chromeMat, {
    outline: 0.008,
  });
  handlebar.rotation.x = Math.PI / 2;
  handlebar.position.set(0.30, 0.94, 0);
  scooter.add(handlebar);

  // Round retro headlight & red taillight
  const headLamp = createCelMesh(new THREE.CylinderGeometry(0.085, 0.085, 0.09, 12), chromeMat, {
    outline: 0.008,
  });
  headLamp.rotation.z = Math.PI / 2;
  headLamp.position.set(0.42, 0.92, 0);
  scooter.add(headLamp);

  const tailLamp = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.09, 0.14),
    glowMat(0xff4a4a, { intensity: 1.05 })
  );
  tailLamp.position.set(-0.69, 0.52, 0);
  scooter.add(tailLamp);

  scooter.position.set(1.75, 0.02, -5.22);
  scooter.rotation.y = -0.14;
  scooter.rotation.x = 0.08; // leaning gently on kickstand
  group.add(scooter);

  // 14. Parking Driveway Entrance Reflective Bollards (車止めポール)
  [-4.40, -7.60].forEach((bz) => {
    const bGroup = new THREE.Group();
    const bPost = createCelMesh(
      new THREE.CylinderGeometry(0.05, 0.055, 0.72, 10),
      celMat(0xe85845, { rimStrength: 0.25 }),
      { outline: 0.01 }
    );
    bPost.position.y = 0.36;
    const stripe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.053, 0.053, 0.12, 10),
      glowMat(0xffffff, { intensity: 0.85 })
    );
    stripe.position.y = 0.56;
    bGroup.add(bPost, stripe);
    bGroup.position.set(3.52, 0.02, bz);
    group.add(bGroup);
  });

  return group;
}
