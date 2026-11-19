import * as THREE from 'three';
import { celMat, glowMat, createCelMesh, createGlowSprite } from '../style/cel.js';
import {
  createBlockWallTexture,
  createSlateSidingTexture,
  createAlleySignTexture,
} from '../style/textures.js';

const FLOOR_Y = 0.16;

function buildACUnit(scale = 1.0) {
  const g = new THREE.Group();
  const bodyMat = celMat(0xe6e4da, { rimStrength: 0.22 });
  const darkMat = celMat(0x21273b, { rimStrength: 0.15 });
  const bladeMat = celMat(0x465273, { rimStrength: 0.25 });

  // Main housing
  const box = createCelMesh(new THREE.BoxGeometry(0.32, 0.54, 0.72), bodyMat, {
    outline: 0.012,
    edges: true,
  });
  g.add(box);

  // Dark fan recess cavity (+X or -X? Build facing +X so easy to orient)
  const shroud = createCelMesh(new THREE.CylinderGeometry(0.20, 0.20, 0.04, 16), darkMat, {
    outline: 0.008,
  });
  shroud.rotation.z = Math.PI / 2;
  shroud.position.set(0.155, 0.01, -0.11);
  g.add(shroud);

  // Spinning 3-blade fan rotor
  const fan = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.16, 0.065), bladeMat);
    blade.position.y = 0.08;
    const arm = new THREE.Group();
    arm.rotation.x = (i / 3) * Math.PI * 2;
    arm.add(blade);
    fan.add(arm);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.04, 10), bladeMat);
  hub.rotation.z = Math.PI / 2;
  fan.add(hub);
  fan.position.set(0.165, 0.01, -0.11);
  g.add(fan);

  // Protective grille rings across fan
  [0.10, 0.16].forEach((r) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 6, 16), celMat(0x8892ad));
    ring.rotation.y = Math.PI / 2;
    ring.position.set(0.182, 0.01, -0.11);
    g.add(ring);
  });

  // Right control louvered panel
  const louverPanel = createCelMesh(new THREE.BoxGeometry(0.03, 0.36, 0.18), celMat(0xc9c6bc), {
    outline: 0,
    edges: true,
  });
  louverPanel.position.set(0.165, 0, 0.22);
  g.add(louverPanel);

  g.scale.setScalar(scale);
  return { group: g, fan };
}

function buildCrate(color) {
  const g = new THREE.Group();
  const crateMat = celMat(color, { rimStrength: 0.24 });
  const innerMat = celMat(0x1f263b);

  const box = createCelMesh(new THREE.BoxGeometry(0.38, 0.26, 0.30), crateMat, {
    outline: 0.01,
    edges: true,
  });
  box.position.y = 0.13;
  g.add(box);

  // Dark bottle tops peeking inside crate
  for (let ix = -1; ix <= 1; ix++) {
    for (let iz = -1; iz <= 1; iz++) {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.06, 8), innerMat);
      cap.position.set(ix * 0.10, 0.25, iz * 0.08);
      g.add(cap);
    }
  }
  return g;
}

export function buildAlleyAndService() {
  const group = new THREE.Group();
  group.name = 'AlleyAndService';
  const fans = [];

  const blockWallMat = celMat(0xd4dcf2, {
    map: createBlockWallTexture(2, 2),
    rimStrength: 0.22,
    wetness: 0.25,
  });
  const copingMat = celMat(0x7c86a3, { rimStrength: 0.24, wetness: 0.35 });
  const neighborWallMat = celMat(0xc4cee8, {
    map: createSlateSidingTexture(2, 3),
    rimStrength: 0.22,
    wetness: 0.3,
  });
  const pipeMat = celMat(0xd4d0c5, { rimStrength: 0.2 });
  const darkMetalMat = celMat(0x2a324a, { rimStrength: 0.24 });

  // 1. Neighboring Concrete Block Wall (ブロック塀) along left side of alley entrance
  const blockWall = createCelMesh(new THREE.BoxGeometry(1.48, 1.42, 0.22), blockWallMat, {
    outline: 0.014,
    edges: true,
  });
  blockWall.position.set(-7.0, FLOOR_Y + 0.71, 1.05);
  group.add(blockWall);

  const blockWallReturn = createCelMesh(new THREE.BoxGeometry(0.22, 1.42, 2.05), blockWallMat, {
    outline: 0.014,
    edges: true,
  });
  blockWallReturn.position.set(-6.36, FLOOR_Y + 0.71, 0.10);
  group.add(blockWallReturn);

  // Block wall top concrete coping stones
  const copingFront = createCelMesh(new THREE.BoxGeometry(1.54, 0.09, 0.28), copingMat, {
    outline: 0.01,
    edges: true,
  });
  copingFront.position.set(-7.0, FLOOR_Y + 1.45, 1.05);
  group.add(copingFront);

  const copingSide = createCelMesh(new THREE.BoxGeometry(0.28, 0.09, 2.12), copingMat, {
    outline: 0.01,
    edges: true,
  });
  copingSide.position.set(-6.36, FLOOR_Y + 1.45, 0.10);
  group.add(copingSide);

  // 2. Neighboring Corner House / Shop Facade Slice (frames the narrow alley!)
  const neighborHouse = createCelMesh(
    new THREE.BoxGeometry(1.52, 3.65, 5.2),
    neighborWallMat,
    { outline: 0.016, edges: true }
  );
  neighborHouse.position.set(-7.02, FLOOR_Y + 1.825, -3.50);
  group.add(neighborHouse);

  // Slanted corrugated awning roof on neighbor house
  const neighborRoof = createCelMesh(
    new THREE.BoxGeometry(1.66, 0.14, 5.36),
    celMat(0x23384f, { rimStrength: 0.30, wetness: 0.55 }),
    { outline: 0.015, edges: true }
  );
  neighborRoof.position.set(-6.98, FLOOR_Y + 3.70, -3.50);
  neighborRoof.rotation.z = -0.10;
  group.add(neighborRoof);

  // Small glowing vertical alley signboard (呑み処 桜) projecting into the alley for depth
  const alleySignCabinet = createCelMesh(
    new THREE.BoxGeometry(0.32, 0.78, 0.10),
    celMat(0x3a2a2a, { rimStrength: 0.22 }),
    { outline: 0.01, edges: true }
  );
  alleySignCabinet.position.set(-6.02, FLOOR_Y + 2.55, -1.08);
  group.add(alleySignCabinet);

  const alleySignTex = createAlleySignTexture();
  const alleySignFaceMat = glowMat(0xffffff, { map: alleySignTex, intensity: 1.08 });
  const alleySignFront = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.72), alleySignFaceMat);
  alleySignFront.position.set(-6.02, FLOOR_Y + 2.55, -1.026);
  const alleySignBack = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.72), alleySignFaceMat);
  alleySignBack.rotation.y = Math.PI;
  alleySignBack.position.set(-6.02, FLOOR_Y + 2.55, -1.134);
  group.add(alleySignFront, alleySignBack);

  const alleySignHalo = createGlowSprite(0xffba73, 1.05, 0.28);
  alleySignHalo.position.set(-6.02, FLOOR_Y + 2.55, -1.02);
  group.add(alleySignHalo);

  // Tiny black anime cat (路地裏の黒猫) perched on the block wall coping looking toward the konbini!
  const catGroup = new THREE.Group();
  const catMat = celMat(0x181c2e, { rimStrength: 0.45, rimColor: 0x8bb6ff });
  const catBody = createCelMesh(new THREE.SphereGeometry(0.11, 10, 10), catMat, { outline: 0.008 });
  catBody.scale.set(0.85, 1.1, 1.15);
  catBody.position.y = 0.11;
  const catHead = createCelMesh(new THREE.SphereGeometry(0.082, 10, 10), catMat, { outline: 0.007 });
  catHead.position.set(0.04, 0.23, 0.04);
  [-0.042, 0.042].forEach((ex) => {
    const ear = createCelMesh(new THREE.ConeGeometry(0.028, 0.06, 4), catMat, { outline: 0.005 });
    ear.position.set(0.04 + ex, 0.31, 0.04);
    catGroup.add(ear);
  });
  // Tiny glowing amber eyes
  [-0.028, 0.028].forEach((ex) => {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.011, 6, 6),
      glowMat(0xffd25a, { intensity: 1.45 })
    );
    eye.position.set(0.04 + ex, 0.24, 0.115);
    catGroup.add(eye);
  });
  // Curved swaying tail
  const tailPivot = new THREE.Group();
  tailPivot.position.set(-0.02, 0.09, -0.09);
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.08, -0.10),
    new THREE.Vector3(0.03, 0.20, -0.13),
  ]);
  const tailMesh = createCelMesh(
    new THREE.TubeGeometry(tailCurve, 10, 0.016, 6, false),
    catMat,
    { outline: 0.006 }
  );
  tailPivot.add(tailMesh);
  catGroup.add(catBody, catHead, tailPivot);
  catGroup.position.set(-6.36, FLOOR_Y + 1.495, 0.56);
  catGroup.rotation.y = 0.65;
  group.add(catGroup);

  // Warm softly glowing frosted apartment window facing alley on 2nd level
  const neighborWinFrame = createCelMesh(new THREE.BoxGeometry(0.08, 0.75, 0.95), darkMetalMat, {
    outline: 0.01,
  });
  neighborWinFrame.position.set(-6.24, FLOOR_Y + 2.55, -2.45);
  group.add(neighborWinFrame);

  const neighborWinGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.84, 0.64),
    glowMat(0xffce8a, { intensity: 0.95 })
  );
  neighborWinGlow.rotation.y = Math.PI / 2;
  neighborWinGlow.position.set(-6.19, FLOOR_Y + 2.55, -2.45);
  group.add(neighborWinGlow);

  // Alley wet stepping stones / concrete slabs leading into the alley
  for (let z = 0.75; z >= -5.6; z -= 0.95) {
    const stone = createCelMesh(
      new THREE.BoxGeometry(1.18, 0.025, 0.72),
      celMat(0x434c69, { rimStrength: 0.18 }),
      { outline: 0, edges: true, edgeOpacity: 0.45 }
    );
    stone.position.set(-5.30, FLOOR_Y + 0.012, z);
    group.add(stone);
  }

  // 3. Alley Caged Wall Lantern (路地裏ブラケットライト) on konbini left wall
  const lanternHood = createCelMesh(new THREE.CylinderGeometry(0.11, 0.15, 0.10, 10), darkMetalMat, {
    outline: 0.01,
  });
  lanternHood.position.set(-4.52, FLOOR_Y + 2.38, -0.30);
  group.add(lanternHood);

  const lanternBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 10, 10),
    glowMat(0xffb866, { intensity: 1.55 })
  );
  lanternBulb.position.set(-4.52, FLOOR_Y + 2.28, -0.30);
  group.add(lanternBulb);

  const lanternHalo = createGlowSprite(0xffb561, 1.25, 0.45);
  lanternHalo.position.set(-4.52, FLOOR_Y + 2.28, -0.30);
  group.add(lanternHalo);

  const lanternArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.04), darkMetalMat);
  lanternArm.position.set(-4.46, FLOOR_Y + 2.40, -0.30);
  group.add(lanternArm);

  // Electric meter box + vertical conduit pipe in alley
  const meterBox = createCelMesh(new THREE.BoxGeometry(0.12, 0.42, 0.32), celMat(0x8893ad), {
    outline: 0.01,
    edges: true,
  });
  meterBox.position.set(-4.44, FLOOR_Y + 1.52, 0.42);
  group.add(meterBox);

  const conduit = createCelMesh(new THREE.CylinderGeometry(0.022, 0.022, 2.6, 8), darkMetalMat, {
    outline: 0.006,
  });
  conduit.position.set(-4.43, FLOOR_Y + 1.5, 0.42);
  group.add(conduit);

  // 4. AC Outdoor Compressor Units (空调外机)
  // Unit A & B mounted on wall brackets inside the left alley (facing -X)
  [-1.25, -2.25].forEach((az, idx) => {
    const { group: ac, fan } = buildACUnit(0.95);
    fans.push(fan);
    ac.rotation.y = Math.PI; // flip so fan faces -X into the alley
    ac.position.set(-4.58, FLOOR_Y + (idx === 0 ? 1.55 : 0.45), az);
    group.add(ac);

    // Wall bracket arms
    [-0.24, 0.24].forEach((dz) => {
      const bracket = createCelMesh(new THREE.BoxGeometry(0.38, 0.05, 0.05), darkMetalMat, {
        outline: 0.006,
      });
      bracket.position.set(-4.58, FLOOR_Y + (idx === 0 ? 1.26 : 0.16), az + dz);
      group.add(bracket);
    });

    // Wrapped refrigerant piping running cleanly up wall
    const pipe = createCelMesh(new THREE.CylinderGeometry(0.025, 0.025, 2.1, 8), pipeMat, {
      outline: 0.006,
    });
    pipe.position.set(-4.46, FLOOR_Y + 1.65, az + 0.34);
    group.add(pipe);
  });

  // Unit C: Larger commercial ground AC unit behind the store (z = -4.52, facing -Z)
  const { group: rearAC, fan: rearFan } = buildACUnit(1.22);
  fans.push(rearFan);
  rearAC.rotation.y = Math.PI / 2; // fan faces -Z
  rearAC.position.set(-1.35, FLOOR_Y + 0.429, -4.56);
  group.add(rearAC);

  const rearACPad = createCelMesh(new THREE.BoxGeometry(1.05, 0.10, 0.54), copingMat, {
    outline: 0.01,
    edges: true,
  });
  rearACPad.position.set(-1.35, FLOOR_Y + 0.05, -4.56);
  group.add(rearACPad);

  // 5. Stacked Beverage Crates (ビールケース) in alley & rear service yard
  const crate1 = buildCrate(0x2878c9);
  crate1.position.set(-4.68, FLOOR_Y, -3.55);
  const crate2 = buildCrate(0x2878c9);
  crate2.position.set(-4.68, FLOOR_Y + 0.26, -3.55);
  crate2.rotation.y = 0.08;
  const crate3 = buildCrate(0xe3a73b);
  crate3.position.set(-4.72, FLOOR_Y, -3.98);
  crate3.rotation.y = -0.12;
  group.add(crate1, crate2, crate3);

  // 6. Low steel pipe barrier separating rear service yard from parking apron
  const barrierPostPositions = [-4.6, -5.8, -7.0];
  barrierPostPositions.forEach((bz) => {
    const post = createCelMesh(new THREE.CylinderGeometry(0.032, 0.032, 0.72, 8), darkMetalMat, {
      outline: 0.008,
    });
    post.position.set(-0.48, FLOOR_Y + 0.36, bz);
    group.add(post);
  });
  const barrierRail = createCelMesh(new THREE.CylinderGeometry(0.025, 0.025, 2.5, 8), darkMetalMat, {
    outline: 0.008,
  });
  barrierRail.rotation.x = Math.PI / 2;
  barrierRail.position.set(-0.48, FLOOR_Y + 0.65, -5.8);
  group.add(barrierRail);

  return {
    group,
    update(delta, elapsed = 0) {
      for (let i = 0; i < fans.length; i++) {
        fans[i].rotation.x += delta * (9.5 + i * 2.1);
      }
      tailPivot.rotation.z = Math.sin(elapsed * 2.4) * 0.22;
    },
  };
}
