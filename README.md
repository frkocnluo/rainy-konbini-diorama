# Rainy Night Konbini Diorama (雨夜便利店街角微缩景观)

A Three.js cel-shaded (三渲二) 3D miniature diorama of a rainy night Japanese convenience store street corner, built on a collectible square plinth with zero UI overlays.

## Live Demo

- **GitHub Pages**: https://frkocnluo.github.io/rainy-konbini-diorama/

## Controls

- **Left-drag**: Orbit / rotate around the diorama
- **Scroll**: Zoom in / out
- **Right-drag**: Pan

## Highlights

- **Anime Cel-Shading (`src/style/cel.js`)**: 4-step toon gradient, cool indigo shadow tint, Fresnel rim light, rain-wet stepped specular highlights, and inverted-hull + crease ink outlines.
- **Japanese Street Corner (`src/scene/`)**: `みどりマート 24時間営業` convenience store with visible interior, automatic sliding doors, rain canopy, `Reflector` real-time puddle reflections with animated raindrop ripples, crosswalks, drainage grates, parking bays with scooter, vending machines, bicycle, umbrella stand, utility poles with catenary power lines, alley entrance with AC units & black cat, and falling anime rain streaks.

## Local Development

```bash
npm install
npm run dev
```
