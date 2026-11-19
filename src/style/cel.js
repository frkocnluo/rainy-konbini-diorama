import * as THREE from 'three';

const INK_COLOR = 0x13162b;

/**
 * 4-step anime cel gradient map with NearestFilter for crisp band transitions.
 */
function createToonGradient(steps = [96, 152, 214, 255]) {
  const data = new Uint8Array(steps.length * 4);
  for (let i = 0; i < steps.length; i++) {
    const v = steps[i];
    data[i * 4] = v;
    data[i * 4 + 1] = v;
    data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, steps.length, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

const DEFAULT_GRADIENT = createToonGradient([88, 146, 212, 255]);
const SOFT_GRADIENT = createToonGradient([106, 164, 224, 255]);

/**
 * Creates a Japanese anime cel-shaded MeshToonMaterial with:
 * - Cool indigo shadow hue shift
 * - Stepped Fresnel rim light for crisp silhouette separation
 * - Optional rain-wet stepped anime specular sheen (wetness > 0)
 */
export function celMat(color, opts = {}) {
  const {
    map = null,
    emissive = 0x000000,
    emissiveMap = null,
    emissiveIntensity = 1.0,
    transparent = false,
    opacity = 1.0,
    side = THREE.FrontSide,
    rimStrength = 0.22,
    rimColor = 0x7aa4ff,
    shadowTint = 0x161c3d,
    shadowTintStrength = 0.36,
    wetness = 0.0,
    wetColor = 0xa8d4ff,
    soft = false,
    polygonOffset = false,
    polygonOffsetFactor = 0,
    polygonOffsetUnits = 0,
    depthWrite = true,
  } = opts;

  const mat = new THREE.MeshToonMaterial({
    color,
    map,
    gradientMap: soft ? SOFT_GRADIENT : DEFAULT_GRADIENT,
    emissive,
    emissiveMap,
    emissiveIntensity,
    transparent,
    opacity,
    side,
    polygonOffset,
    polygonOffsetFactor,
    polygonOffsetUnits,
    depthWrite,
  });

  const rimCol = new THREE.Color(rimColor);
  const shdCol = new THREE.Color(shadowTint);
  const wetCol = new THREE.Color(wetColor);

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uRimColor = { value: rimCol };
    shader.uniforms.uRimStrength = { value: rimStrength };
    shader.uniforms.uShadowTint = { value: shdCol };
    shader.uniforms.uShadowTintStrength = { value: shadowTintStrength };
    shader.uniforms.uWetness = { value: wetness };
    shader.uniforms.uWetColor = { value: wetCol };

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform vec3 uRimColor;
        uniform float uRimStrength;
        uniform vec3 uShadowTint;
        uniform float uShadowTintStrength;
        uniform float uWetness;
        uniform vec3 uWetColor;`
      )
      .replace(
        '#include <opaque_fragment>',
        `
        // Anime shadow hue shift toward cool night indigo (in linear space before tone mapping & fog)
        float lum = dot(outgoingLight, vec3(0.2126, 0.7152, 0.0722));
        float shadowFactor = 1.0 - smoothstep(0.03, 0.22, lum);
        outgoingLight = mix(outgoingLight, max(outgoingLight, uShadowTint), shadowFactor * uShadowTintStrength);

        vec3 nNorm = normalize(normal);
        vec3 viewDirNorm = normalize(vViewPosition);
        float ndotv = clamp(dot(nNorm, viewDirNorm), 0.0, 1.0);

        // Stepped Fresnel rim light for clean anime silhouette separation
        float fresnel = 1.0 - ndotv;
        float rimBand = smoothstep(0.58, 0.70, fresnel);
        outgoingLight += uRimColor * rimBand * uRimStrength * (0.35 + 0.65 * clamp(lum * 2.5, 0.0, 1.0));

        // Optional anime rain-wet stepped specular gleam
        if (uWetness > 0.01) {
          vec3 keyDir = normalize(vec3(-0.35, 0.78, 0.52));
          vec3 halfV = normalize(keyDir + viewDirNorm);
          float spec = pow(clamp(dot(nNorm, halfV), 0.0, 1.0), 36.0);
          float celSpec = smoothstep(0.32, 0.42, spec);
          float wetGlint = smoothstep(0.72, 0.88, fresnel) * 0.35;
          outgoingLight += uWetColor * (celSpec * 0.45 + wetGlint) * uWetness;
        }

        #include <opaque_fragment>
        `
      );
  };

  return mat;
}

/**
 * Clean unlit / glowing anime emissive material (for neon signs, vending windows, lamps).
 */
export function glowMat(color, opts = {}) {
  const {
    map = null,
    intensity = 1.35,
    transparent = false,
    opacity = 1.0,
    side = THREE.FrontSide,
    depthWrite = true,
  } = opts;

  const base = new THREE.Color(color).multiplyScalar(intensity);
  return new THREE.MeshBasicMaterial({
    color: base,
    map,
    transparent,
    opacity,
    side,
    depthWrite,
    toneMapped: true,
  });
}

let cachedGlowTex = null;
function getSoftGlowTexture() {
  if (cachedGlowTex) return cachedGlowTex;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 64);
  grad.addColorStop(0.0, 'rgba(255,255,255,1.0)');
  grad.addColorStop(0.28, 'rgba(255,255,255,0.55)');
  grad.addColorStop(0.62, 'rgba(255,255,255,0.14)');
  grad.addColorStop(1.0, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  cachedGlowTex = new THREE.CanvasTexture(c);
  cachedGlowTex.colorSpace = THREE.SRGBColorSpace;
  return cachedGlowTex;
}

/**
 * Creates a soft additive anime halation sprite around lamps and neon lights.
 */
export function createGlowSprite(color, size = 1.4, opacity = 0.55) {
  const mat = new THREE.SpriteMaterial({
    map: getSoftGlowTexture(),
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(size, size, 1);
  sprite.raycast = () => {};
  return sprite;
}

/**
 * Computes averaged smooth normals per shared 3D vertex position so BackSide
 * inverted-hull outlines wrap cleanly around sharp corners with zero gaps.
 */
const smoothOutlineGeomCache = new WeakMap();

function getSmoothOutlineGeometry(geometry) {
  if (smoothOutlineGeomCache.has(geometry)) {
    return smoothOutlineGeomCache.get(geometry);
  }

  const clone = geometry.clone();
  const pos = clone.attributes.position;
  const norm = clone.attributes.normal;
  if (!pos || !norm) return clone;

  const accum = new Map();
  const keyOf = (i) =>
    `${Math.round(pos.getX(i) * 10000)}_${Math.round(pos.getY(i) * 10000)}_${Math.round(pos.getZ(i) * 10000)}`;

  for (let i = 0; i < pos.count; i++) {
    const k = keyOf(i);
    let v = accum.get(k);
    if (!v) {
      v = new THREE.Vector3();
      accum.set(k, v);
    }
    v.x += norm.getX(i);
    v.y += norm.getY(i);
    v.z += norm.getZ(i);
  }

  const smoothArr = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const sum = accum.get(keyOf(i));
    const v =
      sum && sum.lengthSq() > 1e-6
        ? sum.clone().normalize()
        : new THREE.Vector3(norm.getX(i), norm.getY(i), norm.getZ(i)).normalize();
    smoothArr[i * 3] = v.x;
    smoothArr[i * 3 + 1] = v.y;
    smoothArr[i * 3 + 2] = v.z;
  }
  clone.setAttribute('aSmoothNormal', new THREE.BufferAttribute(smoothArr, 3));
  smoothOutlineGeomCache.set(geometry, clone);
  return clone;
}

const outlineMatCache = new Map();

function getOutlineMaterial(thickness, color) {
  const key = `${thickness.toFixed(4)}_${color}`;
  if (outlineMatCache.has(key)) return outlineMatCache.get(key);

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uThickness: { value: thickness },
      uColor: { value: new THREE.Color(color) },
    },
    vertexShader: `
      attribute vec3 aSmoothNormal;
      uniform float uThickness;
      void main() {
        vec3 extruded = position + aSmoothNormal * uThickness;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(extruded, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      void main() {
        gl_FragColor = vec4(uColor, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: true,
  });

  outlineMatCache.set(key, mat);
  return mat;
}

/**
 * Attaches a crisp BackSide anime ink hull outline as a child of a Mesh.
 */
export function addOutline(mesh, thickness = 0.018, color = INK_COLOR) {
  const geom = getSmoothOutlineGeometry(mesh.geometry);
  const mat = getOutlineMaterial(thickness, color);
  const outline = new THREE.Mesh(geom, mat);
  outline.name = '__outline';
  outline.castShadow = false;
  outline.receiveShadow = false;
  outline.raycast = () => {};
  mesh.add(outline);
  return mesh;
}

/**
 * Attaches crisp architectural crease lines using EdgesGeometry.
 */
export function addInkEdges(mesh, thresholdAngle = 28, color = 0x161b33, opacity = 0.68) {
  const edges = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
  const lineMat = new THREE.LineBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
  });
  const lines = new THREE.LineSegments(edges, lineMat);
  lines.name = '__inkEdges';
  lines.raycast = () => {};
  mesh.add(lines);
  return mesh;
}

/**
 * Convenience helper to create a cel-shaded mesh with optional outline & ink creases.
 */
export function createCelMesh(geometry, material, opts = {}) {
  const {
    outline = 0.016,
    outlineColor = INK_COLOR,
    edges = false,
    edgeAngle = 32,
    edgeOpacity = 0.55,
    castShadow = true,
    receiveShadow = true,
  } = opts;

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  if (outline > 0) addOutline(mesh, outline, outlineColor);
  if (edges) addInkEdges(mesh, edgeAngle, outlineColor, edgeOpacity);
  return mesh;
}
