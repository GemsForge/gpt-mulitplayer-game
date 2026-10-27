# Blender model pipeline

Export optimized `.glb` files from Blender into this folder. Keep one file per
customizable layer so the client can swap identity, skin tone, body type,
clothing, and props without rebuilding the whole avatar.

Recommended first-pass exports:

- `avatar-base.glb` — neutral rig with FEM, MALE, and NON-B body proportions
- `skin-tone-01.glb` through `skin-tone-04.glb` — material variants
- `top-quarter-zip.glb`, `top-startup-tee.glb`, `top-black-hoodie.glb`, `top-conference-blazer.glb`
- `prop-glasses.glb`, `prop-keyboard.glb`, `prop-laptop.glb`, `prop-cold-brew.glb`

The current React screen uses a lightweight CSS avatar until these exports are
available. The asset boundary is intentionally GLB/GLTF so it can be reused by
the browser client and a future React Native 3D view.
