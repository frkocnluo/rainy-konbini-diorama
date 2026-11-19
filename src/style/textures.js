import * as THREE from 'three';

function makeCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

function toTexture(canvas, opts = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (opts.repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(opts.repeat[0], opts.repeat[1]);
  }
  tex.needsUpdate = true;
  return tex;
}

const JP_FONT = '"Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "Noto Sans JP", sans-serif';

/**
 * Main Konbini Fascia Signboard: みどりマート (Midori Mart) 24H
 */
export function createKonbiniFasciaTexture() {
  const { canvas, ctx } = makeCanvas(1024, 256);

  // Clean cream-white backdrop
  ctx.fillStyle = '#f8f5ec';
  ctx.fillRect(0, 0, 1024, 256);

  // Iconic tri-color anime konbini stripes across top & bottom
  ctx.fillStyle = '#149e93'; // Teal-emerald
  ctx.fillRect(0, 0, 1024, 48);
  ctx.fillStyle = '#38a3f1'; // Sky cyan
  ctx.fillRect(0, 48, 1024, 22);
  ctx.fillStyle = '#ff7d4d'; // Warm sunset orange
  ctx.fillRect(0, 206, 1024, 50);

  // Crisp ink separator lines
  ctx.fillStyle = '#171c33';
  ctx.fillRect(0, 46, 1024, 4);
  ctx.fillRect(0, 68, 1024, 4);
  ctx.fillRect(0, 204, 1024, 4);

  // Left logo badge
  ctx.fillStyle = '#149e93';
  ctx.beginPath();
  ctx.roundRect(42, 86, 98, 98, 16);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#171c33';
  ctx.stroke();

  // Stylized leaf / M icon inside badge
  ctx.fillStyle = '#fff9ee';
  ctx.font = `900 58px ${JP_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', 91, 138);

  // Store name
  ctx.fillStyle = '#18213a';
  ctx.font = `900 66px ${JP_FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText('みどりマート', 166, 130);

  ctx.fillStyle = '#149e93';
  ctx.font = `800 24px ${JP_FONT}`;
  ctx.fillText('MIDORI MART  •  24時間営業', 170, 178);

  // Right service badges
  const badges = [
    { text: '24H', bg: '#ff7d4d', fg: '#fff9ee' },
    { text: 'ATM', bg: '#38a3f1', fg: '#fff9ee' },
    { text: '酒・たばこ', bg: '#18213a', fg: '#fff9ee' },
  ];
  let bx = 710;
  for (const b of badges) {
    const w = b.text.length > 3 ? 132 : 76;
    ctx.fillStyle = b.bg;
    ctx.beginPath();
    ctx.roundRect(bx, 104, w, 62, 10);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#171c33';
    ctx.stroke();
    ctx.fillStyle = b.fg;
    ctx.font = `800 ${b.text.length > 3 ? 22 : 26}px ${JP_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(b.text, bx + w / 2, 137);
    bx += w + 14;
  }

  return toTexture(canvas);
}

/**
 * Corner side fascia extension (shorter side)
 */
export function createKonbiniSideFasciaTexture() {
  const { canvas, ctx } = makeCanvas(512, 256);
  ctx.fillStyle = '#f8f5ec';
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = '#149e93';
  ctx.fillRect(0, 0, 512, 48);
  ctx.fillStyle = '#38a3f1';
  ctx.fillRect(0, 48, 512, 22);
  ctx.fillStyle = '#ff7d4d';
  ctx.fillRect(0, 206, 512, 50);

  ctx.fillStyle = '#171c33';
  ctx.fillRect(0, 46, 512, 4);
  ctx.fillRect(0, 68, 512, 4);
  ctx.fillRect(0, 204, 512, 4);

  ctx.fillStyle = '#18213a';
  ctx.font = `900 44px ${JP_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('24時間営業', 256, 126);

  ctx.fillStyle = '#149e93';
  ctx.font = `800 26px ${JP_FONT}`;
  ctx.fillText('お弁当 • コーヒー • ATM', 256, 174);

  return toTexture(canvas);
}

/**
 * Tall Freestanding Pylon Sign Texture (24H / 酒 / たばこ / ATM)
 */
export function createPylonSignTexture() {
  const { canvas, ctx } = makeCanvas(256, 512);
  ctx.fillStyle = '#faf7ee';
  ctx.fillRect(0, 0, 256, 512);

  // Top M emblem block
  ctx.fillStyle = '#149e93';
  ctx.fillRect(0, 0, 256, 148);
  ctx.fillStyle = '#38a3f1';
  ctx.fillRect(0, 148, 256, 22);
  ctx.fillStyle = '#ff7d4d';
  ctx.fillRect(0, 170, 256, 22);

  ctx.fillStyle = '#fff9ee';
  ctx.font = `900 72px ${JP_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', 128, 66);
  ctx.font = `800 24px ${JP_FONT}`;
  ctx.fillText('みどりマート', 128, 122);

  // Vertical service tiles
  const rows = [
    { label: 'OPEN 24', bg: '#ff7d4d', fg: '#ffffff', y: 214 },
    { label: '酒', bg: '#18213a', fg: '#ffd98e', y: 294 },
    { label: 'たばこ', bg: '#264478', fg: '#ffffff', y: 374 },
    { label: '銀行 ATM', bg: '#149e93', fg: '#ffffff', y: 444 },
  ];
  for (const r of rows) {
    ctx.fillStyle = r.bg;
    ctx.beginPath();
    ctx.roundRect(22, r.y, 212, 60, 10);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#171c33';
    ctx.stroke();
    ctx.fillStyle = r.fg;
    ctx.font = `900 32px ${JP_FONT}`;
    ctx.fillText(r.label, 128, r.y + 32);
  }

  return toTexture(canvas);
}

/**
 * Storefront Window Decal Posters (Onigiri, Coffee, Part-time, Oden/Nikuman)
 */
export function createWindowPosterTexture(kind = 'coffee') {
  const { canvas, ctx } = makeCanvas(256, 360);

  const themes = {
    coffee: {
      bg: '#fff3e2',
      accent: '#7a4528',
      badge: '#ff7d4d',
      top: '挽きたて',
      main: '珈琲',
      sub: 'HOT / ICE ¥120',
      icon: 'cup',
    },
    onigiri: {
      bg: '#ecfaf5',
      accent: '#149e93',
      badge: '#ff7d4d',
      top: '新発売',
      main: 'おにぎり',
      sub: '厳選具材 ¥140~',
      icon: 'onigiri',
    },
    nikuman: {
      bg: '#fff0eb',
      accent: '#d9483b',
      badge: '#ffaa33',
      top: 'あったか',
      main: '肉まん',
      sub: 'ホカホカ発売中',
      icon: 'steam',
    },
    recruit: {
      bg: '#eef6ff',
      accent: '#2b5ca8',
      badge: '#38a3f1',
      top: 'スタッフ募集中',
      main: '深夜歓迎',
      sub: '時給 ¥1,250~',
      icon: 'star',
    },
  };

  const t = themes[kind] || themes.coffee;
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, 256, 360);

  ctx.lineWidth = 10;
  ctx.strokeStyle = '#171c33';
  ctx.strokeRect(5, 5, 246, 350);

  // Header ribbon
  ctx.fillStyle = t.badge;
  ctx.fillRect(16, 18, 224, 48);
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 28px ${JP_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(t.top, 128, 43);

  // Center illustration
  ctx.fillStyle = t.accent;
  if (t.icon === 'onigiri') {
    ctx.beginPath();
    ctx.moveTo(128, 86);
    ctx.lineTo(188, 184);
    ctx.lineTo(68, 184);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#171c33';
    ctx.stroke();
    ctx.fillStyle = '#1c243b';
    ctx.fillRect(102, 145, 52, 40);
  } else if (t.icon === 'cup') {
    ctx.fillStyle = '#d9b589';
    ctx.beginPath();
    ctx.roundRect(88, 102, 80, 86, 10);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#171c33';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(82, 92, 92, 18);
    ctx.strokeRect(82, 92, 92, 18);
  } else {
    ctx.beginPath();
    ctx.arc(128, 138, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#171c33';
    ctx.stroke();
  }

  ctx.fillStyle = '#171c33';
  ctx.font = `900 44px ${JP_FONT}`;
  ctx.fillText(t.main, 128, 242);

  ctx.fillStyle = t.accent;
  ctx.font = `800 24px ${JP_FONT}`;
  ctx.fillText(t.sub, 128, 304);

  return toTexture(canvas);
}

/**
 * Vending Machine Front Panel Texture (rows of miniature drinks + glowing buttons)
 */
export function createVendingTexture(variant = 'blue') {
  const { canvas, ctx } = makeCanvas(256, 512);
  const isBlue = variant === 'blue';

  // Outer body background
  ctx.fillStyle = isBlue ? '#eef6fc' : '#fff2ed';
  ctx.fillRect(0, 0, 256, 512);

  // Header brand strip
  ctx.fillStyle = isBlue ? '#1c88e5' : '#e85d44';
  ctx.fillRect(14, 14, 228, 46);
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 22px ${JP_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isBlue ? 'DRINKS • 24H' : 'HOT & COLD', 128, 38);

  // Illuminated showcase window
  ctx.fillStyle = '#d9f4ff';
  ctx.fillRect(16, 70, 224, 232);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#18213a';
  ctx.strokeRect(16, 70, 224, 232);

  // 3 shelves of colorful cans & bottles
  const canColors = isBlue
    ? ['#38a3f1', '#149e93', '#ff7d4d', '#f5c242', '#e0566b', '#6d7be8']
    : ['#ff7d4d', '#b85a3a', '#48b884', '#f2b84b', '#38a3f1', '#e86f88'];

  for (let row = 0; row < 3; row++) {
    const y = 84 + row * 72;
    // Shelf rail
    ctx.fillStyle = '#8fa4bd';
    ctx.fillRect(20, y + 48, 216, 6);
    // Selection button strip
    ctx.fillStyle = '#1d2740';
    ctx.fillRect(20, y + 54, 216, 12);

    for (let col = 0; col < 6; col++) {
      const x = 28 + col * 34;
      const c = canColors[(row * 2 + col) % canColors.length];
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.roundRect(x, y + 8, 22, 38, 4);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#171c33';
      ctx.stroke();

      // White label band on can
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 3, y + 18, 16, 10);

      // Tiny glowing blue/red selection button
      ctx.fillStyle = row === 2 && !isBlue ? '#ff7052' : '#73e8ff';
      ctx.fillRect(x + 4, y + 57, 14, 6);
    }
  }

  // Control panel (coin slot, digital readout, bill acceptor)
  ctx.fillStyle = '#24304d';
  ctx.fillRect(164, 316, 74, 86);
  ctx.fillStyle = '#7effb2';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('130', 201, 336);
  ctx.fillStyle = '#9aa8c7';
  ctx.fillRect(182, 354, 38, 10);
  ctx.beginPath();
  ctx.arc(201, 382, 8, 0, Math.PI * 2);
  ctx.fill();

  // Bottom pickup flap
  ctx.fillStyle = '#1a2238';
  ctx.beginPath();
  ctx.roundRect(22, 418, 212, 68, 8);
  ctx.fill();
  ctx.fillStyle = '#314063';
  ctx.fillRect(32, 428, 192, 44);

  return toTexture(canvas);
}

/**
 * Store Interior Shelf / Refrigerated Cooler Backwall Texture
 */
export function createInteriorShelfTexture(type = 'cooler') {
  const { canvas, ctx } = makeCanvas(512, 256);

  if (type === 'cooler') {
    ctx.fillStyle = '#e4f7ff';
    ctx.fillRect(0, 0, 512, 256);
    const cols = ['#38a3f1', '#19b59d', '#ff8559', '#ffd15c', '#e66c8c', '#8273e6', '#67c26f'];
    for (let r = 0; r < 4; r++) {
      const y = 14 + r * 60;
      ctx.fillStyle = '#c4d8e8';
      ctx.fillRect(0, y + 46, 512, 8);
      for (let c = 0; c < 14; c++) {
        const x = 10 + c * 35;
        ctx.fillStyle = cols[(r * 3 + c) % cols.length];
        ctx.fillRect(x, y + 6, 24, 38);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 4, y + 15, 16, 10);
      }
    }
  } else {
    // Warm snack / magazine gondola
    ctx.fillStyle = '#f5e9d3';
    ctx.fillRect(0, 0, 512, 256);
    const cols = ['#ff7d4d', '#f5bd42', '#38a3f1', '#e85d75', '#2cb59d', '#8e6fe8'];
    for (let r = 0; r < 4; r++) {
      const y = 12 + r * 60;
      ctx.fillStyle = '#bfa684';
      ctx.fillRect(0, y + 46, 512, 8);
      for (let c = 0; c < 11; c++) {
        const x = 10 + c * 45;
        ctx.fillStyle = cols[(r * 5 + c) % cols.length];
        ctx.fillRect(x, y + 8, 34, 36);
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fillRect(x + 5, y + 13, 24, 12);
      }
    }
  }

  return toTexture(canvas);
}

/**
 * Japanese Neighborhood Notice Board (町内会掲示板)
 */
export function createNoticeBoardTexture() {
  const { canvas, ctx } = makeCanvas(320, 220);

  // Cork / dark green felt board
  ctx.fillStyle = '#2d544c';
  ctx.fillRect(0, 0, 320, 220);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#5c4330';
  ctx.strokeRect(4, 4, 312, 212);

  // Header strip
  ctx.fillStyle = '#f8f2e4';
  ctx.fillRect(24, 14, 272, 26);
  ctx.fillStyle = '#18213a';
  ctx.font = `900 16px ${JP_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('桜ヶ丘 町内会掲示板', 160, 28);

  // Flyer 1: Yellow community alert
  ctx.fillStyle = '#ffe98c';
  ctx.fillRect(22, 52, 84, 108);
  ctx.fillStyle = '#d9483b';
  ctx.fillRect(28, 58, 72, 20);
  ctx.fillStyle = '#18213a';
  ctx.fillRect(30, 86, 66, 6);
  ctx.fillRect(30, 98, 52, 6);
  ctx.fillRect(30, 110, 62, 6);

  // Flyer 2: Blue map / event poster
  ctx.fillStyle = '#e6f5ff';
  ctx.fillRect(118, 56, 86, 124);
  ctx.fillStyle = '#38a3f1';
  ctx.beginPath();
  ctx.arc(161, 100, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#18213a';
  ctx.fillRect(128, 134, 64, 6);
  ctx.fillRect(128, 146, 54, 6);

  // Flyer 3: Coral festival/lost cat flyer
  ctx.fillStyle = '#fff0eb';
  ctx.fillRect(216, 50, 82, 98);
  ctx.fillStyle = '#ff7d4d';
  ctx.fillRect(224, 58, 66, 26);
  ctx.fillStyle = '#18213a';
  ctx.fillRect(226, 94, 58, 6);
  ctx.fillRect(226, 106, 48, 6);

  // Red & yellow magnets/pins
  const pins = [
    [32, 58, '#e84a4a'],
    [98, 58, '#e84a4a'],
    [161, 62, '#38a3f1'],
    [257, 56, '#ffaa33'],
  ];
  for (const [px, py, col] of pins) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  return toTexture(canvas);
}

/**
 * Japanese Road Signs: 'stop' (止まれ) or 'crosswalk' (横断歩道) or 'address' (街区表示板)
 */
export function createRoadSignTexture(type = 'stop') {
  if (type === 'stop') {
    const { canvas, ctx } = makeCanvas(256, 256);
    ctx.clearRect(0, 0, 256, 256);

    // Inverted red triangle with white border
    ctx.beginPath();
    ctx.moveTo(22, 34);
    ctx.lineTo(234, 34);
    ctx.lineTo(128, 228);
    ctx.closePath();
    ctx.fillStyle = '#e03e3e';
    ctx.fill();
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = `900 44px ${JP_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('止まれ', 128, 92);
    ctx.font = '800 22px sans-serif';
    ctx.fillText('STOP', 128, 136);

    return toTexture(canvas);
  }

  if (type === 'address') {
    const { canvas, ctx } = makeCanvas(128, 384);
    ctx.fillStyle = '#1b63b8';
    ctx.fillRect(0, 0, 128, 384);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(8, 8, 112, 368);

    ctx.fillStyle = '#ffffff';
    ctx.font = `900 34px ${JP_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const chars = ['桜', 'ヶ', '丘', '二', '丁', '目', '14'];
    chars.forEach((ch, idx) => {
      ctx.fillText(ch, 64, 52 + idx * 46);
    });
    return toTexture(canvas);
  }

  // Blue Crosswalk sign
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#1b72c9';
  ctx.beginPath();
  ctx.roundRect(10, 10, 236, 236, 22);
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // White triangle inside blue square
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(128, 42);
  ctx.lineTo(212, 202);
  ctx.lineTo(44, 202);
  ctx.closePath();
  ctx.fill();

  // Crosswalk stripes + walking silhouette
  ctx.fillStyle = '#1b72c9';
  ctx.fillRect(72, 180, 20, 10);
  ctx.fillRect(118, 180, 20, 10);
  ctx.fillRect(164, 180, 20, 10);
  ctx.beginPath();
  ctx.arc(128, 108, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(120, 124, 16, 36);

  return toTexture(canvas);
}

/**
 * Utility Pole Yellow/Black Hazard Band
 */
export function createHazardBandTexture() {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#f2c12e';
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = '#1a1e30';
  for (let i = -256; i < 512; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 32, 0);
    ctx.lineTo(i - 96, 256);
    ctx.lineTo(i - 128, 256);
    ctx.closePath();
    ctx.fill();
  }
  return toTexture(canvas);
}

/**
 * Japanese Yellow Tactile Paving Tile Texture (点字ブロック)
 */
export function createTactileTileTexture() {
  const { canvas, ctx } = makeCanvas(128, 128);
  ctx.fillStyle = '#e5bf3b';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = '#b38e1d';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 124, 124);

  for (let y = 20; y < 128; y += 28) {
    for (let x = 20; x < 128; x += 28) {
      ctx.fillStyle = '#f5d762';
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9e7d19';
      ctx.beginPath();
      ctx.arc(x + 1.5, y + 1.5, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return toTexture(canvas, { repeat: [1, 1] });
}

/**
 * Store Entrance Welcome Mat (いらっしゃいませ)
 */
export function createDoorMatTexture() {
  const { canvas, ctx } = makeCanvas(256, 128);
  ctx.fillStyle = '#25423d';
  ctx.fillRect(0, 0, 256, 128);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#141a29';
  ctx.strokeRect(4, 4, 248, 120);

  ctx.strokeStyle = '#4aa897';
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, 228, 100);

  ctx.fillStyle = '#e7f5ef';
  ctx.font = `800 22px ${JP_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('いらっしゃいませ', 128, 64);

  return toTexture(canvas);
}


/**
 * Painterly Japanese Konbini Exterior Ceramic Wall Tiles (壁タイル)
 */
export function createWallTileTexture(repeatX = 4, repeatY = 2) {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#ece7dc';
  ctx.fillRect(0, 0, 256, 256);

  const cols = 4;
  const rows = 8;
  const tw = 256 / cols;
  const th = 256 / rows;

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (tw * 0.5);
    for (let c = -1; c <= cols; c++) {
      const shade = ((r * 7 + c * 13) & 7) - 3;
      const base = 233 + shade * 2;
      ctx.fillStyle = `rgb(${base}, ${base - 4}, ${base - 14})`;
      ctx.fillRect(c * tw + offset + 2, r * th + 2, tw - 4, th - 4);
    }
  }

  // Subtle grout lines
  ctx.strokeStyle = 'rgba(55, 65, 95, 0.22)';
  ctx.lineWidth = 2;
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * th);
    ctx.lineTo(256, r * th);
    ctx.stroke();
  }

  // Soft anime rain weathering tint near bottom edge
  const grad = ctx.createLinearGradient(0, 180, 0, 256);
  grad.addColorStop(0, 'rgba(32, 42, 72, 0)');
  grad.addColorStop(1, 'rgba(32, 42, 72, 0.14)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 180, 256, 76);

  return toTexture(canvas, { repeat: [repeatX, repeatY] });
}

/**
 * Rain-Wet Night Asphalt Texture (雨夜アスファルト)
 */
export function createWetAsphaltTexture(repeatX = 4, repeatY = 2) {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#232a44';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle aggregate speckles + damp sheen bands
  for (let i = 0; i < 900; i++) {
    const x = (i * 73) % 256;
    const y = (i * 137 + Math.floor(i / 256) * 29) % 256;
    const bright = i % 3 === 0;
    ctx.fillStyle = bright ? 'rgba(110, 130, 185, 0.12)' : 'rgba(14, 18, 36, 0.22)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Soft wet streaks
  const g1 = ctx.createLinearGradient(0, 0, 256, 0);
  g1.addColorStop(0, 'rgba(70, 95, 150, 0.0)');
  g1.addColorStop(0.45, 'rgba(70, 95, 150, 0.10)');
  g1.addColorStop(0.55, 'rgba(18, 24, 46, 0.14)');
  g1.addColorStop(1, 'rgba(70, 95, 150, 0.0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, 256, 256);

  return toTexture(canvas, { repeat: [repeatX, repeatY] });
}

/**
 * Interlocking Japanese Sidewalk Paving Tiles (歩道タイル)
 */
export function createSidewalkTileTexture(repeatX = 6, repeatY = 6) {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#535d7b';
  ctx.fillRect(0, 0, 256, 256);

  const n = 4;
  const s = 256 / n;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const delta = (((r * 11 + c * 5) % 5) - 2) * 4;
      ctx.fillStyle = `rgb(${84 + delta}, ${93 + delta}, ${124 + delta})`;
      ctx.fillRect(c * s + 2, r * s + 2, s - 4, s - 4);
    }
  }
  ctx.strokeStyle = 'rgba(22, 28, 52, 0.42)';
  ctx.lineWidth = 3;
  for (let i = 0; i <= n; i++) {
    ctx.beginPath();
    ctx.moveTo(i * s, 0);
    ctx.lineTo(i * s, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * s);
    ctx.lineTo(256, i * s);
    ctx.stroke();
  }

  return toTexture(canvas, { repeat: [repeatX, repeatY] });
}

/**
 * Japanese Concrete Block Wall (ブロック塀)
 */
export function createBlockWallTexture(repeatX = 2, repeatY = 2) {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#5f6885';
  ctx.fillRect(0, 0, 256, 256);

  const cols = 4;
  const rows = 8;
  const bw = 256 / cols;
  const bh = 256 / rows;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (bw * 0.5);
    for (let c = -1; c <= cols; c++) {
      const d = (((r * 5 + c * 9) % 5) - 2) * 5;
      ctx.fillStyle = `rgb(${96 + d}, ${105 + d}, ${134 + d})`;
      ctx.fillRect(c * bw + off + 2, r * bh + 2, bw - 4, bh - 4);
    }
  }
  ctx.strokeStyle = 'rgba(24, 30, 50, 0.45)';
  ctx.lineWidth = 3;
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * bh);
    ctx.lineTo(256, r * bh);
    ctx.stroke();
  }

  return toTexture(canvas, { repeat: [repeatX, repeatY] });
}

/**
 * Neighboring Japanese Slate Siding Texture (外壁サイディング)
 */
export function createSlateSidingTexture(repeatX = 2, repeatY = 2) {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#2d3652';
  ctx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y += 16) {
    ctx.fillStyle = y % 32 === 0 ? '#323c5b' : '#29324c';
    ctx.fillRect(0, y, 256, 14);
    ctx.fillStyle = 'rgba(14, 18, 34, 0.45)';
    ctx.fillRect(0, y + 14, 256, 2);
  }
  return toTexture(canvas, { repeat: [repeatX, repeatY] });
}

/**
 * Vertical Japanese Konbini Nobori Banner Flag (のぼり旗)
 */
export function createNoboriTexture() {
  const { canvas, ctx } = makeCanvas(192, 512);
  ctx.fillStyle = '#fff5e6';
  ctx.fillRect(0, 0, 192, 512);

  // Top & bottom vibrant bands
  ctx.fillStyle = '#149e93';
  ctx.fillRect(0, 0, 192, 92);
  ctx.fillStyle = '#ff7d4d';
  ctx.fillRect(0, 424, 192, 88);

  // Diagonal dynamic stripe
  ctx.fillStyle = 'rgba(56, 163, 241, 0.16)';
  ctx.beginPath();
  ctx.moveTo(0, 130);
  ctx.lineTo(192, 95);
  ctx.lineTo(192, 230);
  ctx.lineTo(0, 265);
  ctx.closePath();
  ctx.fill();

  ctx.lineWidth = 8;
  ctx.strokeStyle = '#171c33';
  ctx.strokeRect(4, 4, 184, 504);

  ctx.fillStyle = '#ffffff';
  ctx.font = `900 32px ${JP_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('24H', 96, 48);

  ctx.fillStyle = '#18213a';
  ctx.font = `900 50px ${JP_FONT}`;
  ['挽', 'き', 'た', 'て', '珈', '琲'].forEach((ch, idx) => {
    ctx.fillText(ch, 96, 132 + idx * 48);
  });

  ctx.fillStyle = '#ffffff';
  ctx.font = `900 28px ${JP_FONT}`;
  ctx.fillText('¥120~', 96, 468);

  return toTexture(canvas);
}

/**
 * Small Glowing Alley Vertical Signboard (路地裏の看板)
 */
export function createAlleySignTexture() {
  const { canvas, ctx } = makeCanvas(128, 320);
  ctx.fillStyle = '#fff2d9';
  ctx.fillRect(0, 0, 128, 320);

  ctx.lineWidth = 10;
  ctx.strokeStyle = '#b8382c';
  ctx.strokeRect(8, 8, 112, 304);

  ctx.fillStyle = '#241c24';
  ctx.font = `900 48px ${JP_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ['呑', 'み', '処', '桜'].forEach((ch, i) => {
    ctx.fillText(ch, 64, 58 + i * 66);
  });

  return toTexture(canvas);
}

/**
 * Soft Radial Colored Wet-Ground Neon Reflection Pool Decal
 */
export function createGroundGlowTexture(hexColor = '#ffd9a0') {
  const { canvas, ctx } = makeCanvas(256, 256);
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 126);
  grad.addColorStop(0.0, hexColor);
  grad.addColorStop(0.45, hexColor + '66');
  grad.addColorStop(1.0, hexColor + '00');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return toTexture(canvas);
}
