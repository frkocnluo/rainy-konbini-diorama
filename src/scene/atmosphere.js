import * as THREE from 'three';

function getLandingHeight(x, z) {
  // Konbini main roof / canopy bounds
  if (x >= -4.55 && x <= 2.75 && z >= -4.35 && z <= 2.31) {
    return 3.55;
  }
  // Neighboring alley house roof
  if (x >= -7.8 && x <= -6.15 && z >= -6.2 && z <= -0.8) {
    return 3.85;
  }
  // Sidewalk area
  if (x <= 3.82 && z <= 3.82 && !(x >= -0.35 && z <= -4.25)) {
    return 0.17;
  }
  return 0.02;
}

export function buildAtmosphere() {
  const group = new THREE.Group();
  group.name = 'Atmosphere';

  // 1. Anime Night Sky Gradient Dome
  const skyGeom = new THREE.SphereGeometry(95, 32, 24);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTopColor: { value: new THREE.Color(0x070b1a) },
      uMidColor: { value: new THREE.Color(0x111a36) },
      uHorizonColor: { value: new THREE.Color(0x1f2b4d) },
      uBottomColor: { value: new THREE.Color(0x0c1124) },
    },
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uTopColor;
      uniform vec3 uMidColor;
      uniform vec3 uHorizonColor;
      uniform vec3 uBottomColor;
      varying vec3 vDir;
      void main() {
        float h = vDir.y;
        vec3 col = mix(uBottomColor, uHorizonColor, smoothstep(-0.35, 0.02, h));
        col = mix(col, uMidColor, smoothstep(0.02, 0.35, h));
        col = mix(col, uTopColor, smoothstep(0.35, 0.92, h));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
  const skyDome = new THREE.Mesh(skyGeom, skyMat);
  skyDome.raycast = () => {};
  group.add(skyDome);

  // 2. Stylized Falling Anime Rain Streaks confined cleanly to diorama footprint
  const dropCount = 460;
  const positions = new Float32Array(dropCount * 2 * 3);
  const speeds = new Float32Array(dropCount);
  const lengths = new Float32Array(dropCount);
  const baseX = new Float32Array(dropCount);
  const baseZ = new Float32Array(dropCount);
  const dropY = new Float32Array(dropCount);

  const windX = -0.055;
  const windZ = 0.032;

  for (let i = 0; i < dropCount; i++) {
    const x = (Math.random() - 0.5) * 15.6;
    const z = (Math.random() - 0.5) * 15.6;
    const minH = getLandingHeight(x, z);
    const y = minH + Math.random() * (11.5 - minH);

    baseX[i] = x;
    baseZ[i] = z;
    dropY[i] = y;
    speeds[i] = 10.5 + Math.random() * 4.5;
    lengths[i] = 0.42 + Math.random() * 0.34;

    const idx = i * 6;
    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
    positions[idx + 3] = x - windX * lengths[i];
    positions[idx + 4] = y + lengths[i];
    positions[idx + 5] = z - windZ * lengths[i];
  }

  const rainGeom = new THREE.BufferGeometry();
  rainGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const rainMat = new THREE.LineBasicMaterial({
    color: 0xaad4ff,
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
  });
  const rainLines = new THREE.LineSegments(rainGeom, rainMat);
  rainLines.frustumCulled = false;
  group.add(rainLines);

  // 3. Tiny Expanding Raindrop Splash Rings on Wet Surfaces & Roof
  const splashCount = 44;
  const ringGeom = new THREE.RingGeometry(0.055, 0.085, 16);
  ringGeom.rotateX(-Math.PI / 2);

  const splashes = [];
  for (let i = 0; i < splashCount; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x9ed2ff,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(ringGeom, mat);
    const sx = (Math.random() - 0.5) * 14.8;
    const sz = (Math.random() - 0.5) * 14.8;
    const sy = getLandingHeight(sx, sz) + 0.018;
    mesh.position.set(sx, sy, sz);
    group.add(mesh);
    splashes.push({
      mesh,
      mat,
      phase: Math.random(),
      speed: 1.3 + Math.random() * 0.9,
    });
  }

  return {
    group,
    update(delta) {
      const posAttr = rainGeom.attributes.position;
      const arr = posAttr.array;

      for (let i = 0; i < dropCount; i++) {
        const sp = speeds[i] * delta;
        dropY[i] -= sp;
        baseX[i] += windX * sp;
        baseZ[i] += windZ * sp;

        const minH = getLandingHeight(baseX[i], baseZ[i]);
        if (
          dropY[i] < minH ||
          Math.abs(baseX[i]) > 7.9 ||
          Math.abs(baseZ[i]) > 7.9
        ) {
          baseX[i] = (Math.random() - 0.5) * 15.6;
          baseZ[i] = (Math.random() - 0.5) * 15.6;
          dropY[i] = 10.5 + Math.random() * 1.8;
        }

        const idx = i * 6;
        const len = lengths[i];
        arr[idx] = baseX[i];
        arr[idx + 1] = dropY[i];
        arr[idx + 2] = baseZ[i];
        arr[idx + 3] = baseX[i] - windX * len;
        arr[idx + 4] = dropY[i] + len;
        arr[idx + 5] = baseZ[i] - windZ * len;
      }
      posAttr.needsUpdate = true;

      for (let i = 0; i < splashCount; i++) {
        const s = splashes[i];
        s.phase += delta * s.speed;
        if (s.phase >= 1.0) {
          s.phase -= 1.0;
          const sx = (Math.random() - 0.5) * 14.8;
          const sz = (Math.random() - 0.5) * 14.8;
          s.mesh.position.set(sx, getLandingHeight(sx, sz) + 0.018, sz);
        }
        const scale = 0.25 + s.phase * 1.45;
        s.mesh.scale.setScalar(scale);
        s.mat.opacity = (1.0 - s.phase) * 0.48;
      }
    },
  };
}
