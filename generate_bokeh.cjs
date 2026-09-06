const { Jimp } = require("jimp");
const fs = require("fs");

const W = 1920;
const H = 1080;

const img = new Jimp({ width: W, height: H, color: 0x030612ff });
const data = img.bitmap.data;

// Helper to additively blend RGB into buffer
function addPixel(x, y, r, g, b, a = 1.0) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const idx = (y * W + x) * 4;
  data[idx]     = Math.min(255, data[idx]     + r * a);
  data[idx + 1] = Math.min(255, data[idx + 1] + g * a);
  data[idx + 2] = Math.min(255, data[idx + 2] + b * a);
}

// 1. Render Base Background Gradients
console.log("Rendering background gradients...");
for (let y = 0; y < H; y++) {
  const ny = y / H;
  for (let x = 0; x < W; x++) {
    const nx = x / W;
    const idx = (y * W + x) * 4;
    
    // Deep dark cosmos gradient
    // Horizon near y=0.5
    const horizonDist = Math.abs(ny - 0.52);
    const horizonGlow = Math.exp(-horizonDist * 5.0) * 0.28;
    
    // Ambient color gradient
    let r = 2 + 10 * horizonGlow;
    let g = 5 + 30 * horizonGlow;
    let b = 14 + 75 * horizonGlow;
    
    // Left flare ambient glow
    const flareDx = (nx - 0.08) * 1.5;
    const flareDy = (ny - 0.49);
    const flareDist = Math.sqrt(flareDx * flareDx + flareDy * flareDy);
    const flareAmb = Math.exp(-flareDist * 3.5) * 0.35;
    
    r += 20 * flareAmb;
    g += 55 * flareAmb;
    b += 110 * flareAmb;

    // Subtle dark indigo vignette at edges
    const edgeDist = Math.hypot(nx - 0.5, ny - 0.5);
    const vignette = Math.max(0.4, 1.0 - edgeDist * 0.6);

    data[idx]     = Math.min(255, Math.round(r * vignette));
    data[idx + 1] = Math.min(255, Math.round(g * vignette));
    data[idx + 2] = Math.min(255, Math.round(b * vignette));
    data[idx + 3] = 255;
  }
}

// Helper to draw realistic Bokeh Disc
// Bokeh discs have a soft interior with a slightly brighter aperture rim (chromatic/spherical aberration)
function drawBokehDisc(cx, cy, radius, r, g, b, alpha, softness = 0.35, rimStrength = 0.45) {
  const rCeil = Math.ceil(radius * 1.25);
  const minX = Math.max(0, Math.floor(cx - rCeil));
  const maxX = Math.min(W - 1, Math.ceil(cx + rCeil));
  const minY = Math.max(0, Math.floor(cy - rCeil));
  const maxY = Math.min(H - 1, Math.ceil(cy + rCeil));

  for (let y = minY; y <= maxY; y++) {
    const dy = y - cy;
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > radius * 1.15) continue;

      const normD = d / radius;
      let intensity = 0;
      if (normD <= 1.0) {
        // Base fill with edge rim emphasis
        const edgeFactor = Math.pow(normD, 2.8) * rimStrength;
        intensity = (1.0 - edgeFactor * 0.4) + edgeFactor;
        // Edge anti-aliasing / softness
        if (normD > 1.0 - softness) {
          const fade = (1.0 - normD) / softness;
          intensity *= fade;
        }
      } else {
        // Outer soft falloff
        const fade = (1.15 - normD) / 0.15;
        intensity = Math.max(0, fade) * 0.2;
      }

      addPixel(x, y, r, g, b, alpha * intensity);
    }
  }
}

// Draw Gaussian-like glow
function drawGlow(cx, cy, radius, r, g, b, alpha) {
  const rCeil = Math.ceil(radius * 1.5);
  const minX = Math.max(0, Math.floor(cx - rCeil));
  const maxX = Math.min(W - 1, Math.ceil(cx + rCeil));
  const minY = Math.max(0, Math.floor(cy - rCeil));
  const maxY = Math.min(H - 1, Math.ceil(cy + rCeil));

  for (let y = minY; y <= maxY; y++) {
    const dy = y - cy;
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > radius * 1.5) continue;
      const falloff = Math.exp(- (d * d) / (2 * (radius * 0.45) * (radius * 0.45)));
      addPixel(x, y, r, g, b, alpha * falloff);
    }
  }
}

// Pseudo-random generator with seed
let seed = 42891;
function rnd() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

console.log("Generating background bokeh...");

// 2. Distant background bokeh in upper dark area
for (let i = 0; i < 45; i++) {
  const x = rnd() * W;
  const y = rnd() * (H * 0.55);
  const radius = 8 + rnd() * 26;
  const isCyan = rnd() > 0.4;
  const r = isCyan ? 40 : 110;
  const g = isCyan ? 140 : 100;
  const b = isCyan ? 255 : 240;
  const a = 0.08 + rnd() * 0.16;
  drawBokehDisc(x, y, radius, r, g, b, a, 0.4, 0.2);
}

// A warm highlight bokeh in top center-right (just like reference)
drawBokehDisc(W * 0.65, H * 0.15, 38, 140, 110, 160, 0.12, 0.5, 0.2);
drawBokehDisc(W * 0.72, H * 0.22, 28, 90, 120, 200, 0.14, 0.5, 0.2);

// 3. Dense Midground / Foreground Bokeh Field (Lower half)
console.log("Generating lower bokeh field...");
// Layer 1: Deep blue background bokeh discs
for (let i = 0; i < 280; i++) {
  const x = rnd() * W;
  const y = H * 0.46 + rnd() * (H * 0.54);
  const depth = (y - H * 0.46) / (H * 0.54); // 0 at horizon, 1 at bottom
  const radius = 5 + depth * 28 + rnd() * 14;
  const a = (0.15 + rnd() * 0.25) * (0.5 + 0.5 * (1 - depth * 0.3));
  
  // Color palette: deep electric blues, ultramarine, cyan
  const colChoice = rnd();
  let r, g, b;
  if (colChoice < 0.4) {
    r = 20; g = 80; b = 230;
  } else if (colChoice < 0.75) {
    r = 0; g = 140; b = 255;
  } else {
    r = 60; g = 180; b = 255;
  }
  drawBokehDisc(x, y, radius, r, g, b, a, 0.25, 0.35);
}

// Layer 2: Glowing cyan and bright white bokeh circles (focused horizon plane)
for (let i = 0; i < 420; i++) {
  // Biased towards center and horizon
  const x = rnd() * W;
  const yBias = Math.pow(rnd(), 1.6);
  const y = H * 0.48 + yBias * (H * 0.48);
  const depth = (y - H * 0.48) / (H * 0.48);
  const radius = 3 + depth * 18 + rnd() * 8;
  const isHot = rnd() < 0.25;
  const r = isHot ? 230 : (rnd() < 0.5 ? 0 : 70);
  const g = isHot ? 245 : (rnd() < 0.5 ? 200 : 220);
  const b = 255;
  const a = 0.25 + rnd() * 0.45;
  drawBokehDisc(x, y, radius, r, g, b, a, 0.2, 0.5);
}

// Layer 3: Large foreground defocused bokeh orbs (bottom 30%)
for (let i = 0; i < 75; i++) {
  const x = rnd() * W;
  const y = H * 0.70 + rnd() * (H * 0.30);
  const radius = 24 + rnd() * 45;
  const a = 0.12 + rnd() * 0.22;
  const isCyan = rnd() > 0.45;
  const r = isCyan ? 0 : 25;
  const g = isCyan ? 130 : 75;
  const b = 255;
  drawBokehDisc(x, y, radius, r, g, b, a, 0.45, 0.25);
}

// 4. Center-midground Dense Particle Cloud / Constellation
console.log("Generating particle constellation...");
for (let i = 0; i < 3500; i++) {
  // Wave shape across horizon: y ≈ 0.51 * H + wave
  const nx = rnd();
  const x = nx * W;
  const wave = Math.sin(nx * 5.0) * 25 + Math.cos(nx * 11.0) * 15;
  const spreadY = (rnd() - 0.5) * 140 * Math.exp(-Math.pow((nx - 0.45) * 2.2, 2) + 0.3);
  const y = H * 0.52 + wave + spreadY;

  // Particle brightness
  const pSize = rnd() < 0.85 ? (rnd() * 1.8 + 0.6) : (rnd() * 3.2 + 1.8);
  const isBright = rnd() < 0.35;
  const r = isBright ? 240 : (rnd() < 0.5 ? 0 : 80);
  const g = isBright ? 250 : (rnd() < 0.5 ? 220 : 210);
  const b = 255;
  const a = 0.4 + rnd() * 0.6;

  if (pSize <= 1.5) {
    addPixel(Math.round(x), Math.round(y), r, g, b, a);
    addPixel(Math.round(x + 1), Math.round(y), r * 0.5, g * 0.5, b * 0.5, a);
    addPixel(Math.round(x), Math.round(y + 1), r * 0.5, g * 0.5, b * 0.5, a);
  } else {
    drawBokehDisc(x, y, pSize, r, g, b, a, 0.15, 0.6);
  }
}

// Extra sparkling micro-dust all across the frame
for (let i = 0; i < 1800; i++) {
  const x = rnd() * W;
  const y = rnd() * H;
  const r = 180 + rnd() * 75;
  const g = 220 + rnd() * 35;
  const b = 255;
  const a = 0.2 + rnd() * 0.65;
  addPixel(Math.round(x), Math.round(y), r, g, b, a);
  if (rnd() > 0.6) {
    addPixel(Math.round(x + 1), Math.round(y), r * 0.6, g * 0.6, b * 0.6, a);
  }
}

// 5. Left Horizon Anamorphic Lens Flare
console.log("Generating anamorphic lens flare...");
const flareX = W * 0.09; // ~172 px
const flareY = H * 0.485; // ~524 px

// Broad volumetric radial glow
drawGlow(flareX, flareY, 320, 0, 110, 255, 0.45);
drawGlow(flareX, flareY, 180, 0, 190, 255, 0.65);
drawGlow(flareX, flareY, 90, 120, 230, 255, 0.85);
drawGlow(flareX, flareY, 40, 240, 250, 255, 1.0);

// Core brilliant starburst
for (let r = 1; r < 20; r++) {
  for (let a = 0; a < Math.PI * 2; a += 0.05) {
    const px = Math.round(flareX + Math.cos(a) * r);
    const py = Math.round(flareY + Math.sin(a) * r);
    addPixel(px, py, 255, 255, 255, 1.0);
  }
}

// Horizontal Anamorphic Streak Line
console.log("Drawing anamorphic streak...");
for (let x = 0; x < W * 0.85; x++) {
  const distFromCenter = Math.abs(x - flareX);
  // Attenuation
  const streakAlpha = Math.exp(-distFromCenter / 450);
  if (streakAlpha < 0.01) continue;

  // Vertical core (tapering height)
  const coreH = Math.max(1, 3.5 * Math.exp(-distFromCenter / 150));
  for (let dy = -6; dy <= 6; dy++) {
    const y = Math.round(flareY + dy);
    const yDist = Math.abs(dy);
    if (yDist <= coreH) {
      // Hot white/cyan core
      const coreAlpha = streakAlpha * (1.0 - yDist / (coreH + 0.5));
      addPixel(x, y, 220, 245, 255, coreAlpha * 0.95);
    }
    // Outer cyan halo
    const haloAlpha = streakAlpha * Math.exp(-yDist * yDist / 8.0) * 0.45;
    addPixel(x, y, 0, 180, 255, haloAlpha);
  }
}

// Chromatic ghost flares on the horizontal line
drawGlow(flareX + 220, flareY, 45, 0, 130, 255, 0.35);
drawBokehDisc(flareX + 380, flareY, 16, 80, 190, 255, 0.4, 0.3, 0.4);
drawBokehDisc(flareX + 640, flareY, 22, 0, 150, 255, 0.3, 0.3, 0.3);
drawGlow(flareX + 900, flareY, 70, 0, 90, 220, 0.2);

// Save image
console.log("Writing output images...");
img.write("src/assets/blue-bokeh-flare.jpg").then(() => {
  console.log("Saved src/assets/blue-bokeh-flare.jpg");
  fs.copyFileSync("src/assets/blue-bokeh-flare.jpg", "public/blue-bokeh-flare.jpg");
  fs.copyFileSync("src/assets/blue-bokeh-flare.jpg", "src/assets/noir-doorway.jpg");
  fs.copyFileSync("src/assets/blue-bokeh-flare.jpg", "public/noir-doorway.jpg");
  console.log("All asset targets updated successfully!");
}).catch(err => {
  console.error("Error saving image:", err);
});
