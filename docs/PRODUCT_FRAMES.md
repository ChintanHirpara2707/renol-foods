# Product Turntable Frames Specification & Production Guide

This guide details how to create and export 360° interactive turntable frame sets for the **Powder Studio** carousel on the Renol Foods website.

---

## 1. Overview & Architecture

The Powder Studio supports interactive 360° rotation with inertia, frame blending, and real-time pixel-sampled particle crumbling for any product. 

- **Dynamic Activation**: Any product in `src/data/products.ts` can enable the 360° spin simply by specifying:
  ```ts
  spinFrames: 36,
  framesFolder: "/frames/<slug>/", // e.g. /frames/apple-powder/
  ```
- **Graceful Fallback**: Products without frames retain their high-resolution vector SVG artwork (`#f-<id>`), so adding or omitting frames never breaks any product.
- **Two-Stage Loading**: Frame `10.webp` is loaded immediately as the idle poster frame. The remaining 35 frames are loaded in the background during browser idle time via `requestIdleCallback`.

---

## 2. Technical Specifications

| Parameter | Specification | Notes |
| :--- | :--- | :--- |
| **File Format** | **WebP** (`image/webp`) | Must support true alpha transparency (RGBA). |
| **Dimensions** | **400 × 480 px** | Width: 400 px, Height: 480 px (5:6 aspect ratio). |
| **Frame Count** | **36 frames** | Rotated clockwise at exact **10° increments** around vertical Y-axis. |
| **Naming Convention** | `00.webp` to `35.webp` | Zero-padded 2-digit format (`00.webp`, `01.webp`, ... `35.webp`). |
| **Target File Size** | **~12 KB to 18 KB** per frame | Total frame set should be under **600 KB**. |
| **Compression** | Lossy WebP, Quality 85–90 | `cwebp -q 88 -alpha_q 100` |
| **Idle Poster Frame** | `10.webp` (100° angle) | This frame is displayed on initial page render. |
| **Folder Location** | `/public/frames/<slug>/` | e.g. `/public/frames/apple-powder/` or `/public/frames/tomato-powder/` |

---

## 3. Method A: 3D Turntable Render in Blender

If you have a 3D scan or model of the fruit/ingredient (e.g. apple, ginger, tomato):

### Step 1: Scene & Object Setup
1. Open Blender and import the fruit 3D model.
2. Center the object origin at `(X: 0, Y: 0, Z: 0)`.
3. Set the camera to a fixed position:
   - Focal Length: `50mm` or `85mm` (avoid wide-angle perspective distortion).
   - Tilt angle: ~12° to 16° looking slightly down at the subject.
4. Scale and position the object so it fills approximately 80% of the camera frame height, leaving comfortable margin around edges.

### Step 2: Lighting & Alpha Transparency
1. In **Render Properties**:
   - Render Engine: Cycles or Eevee Next.
   - Go to **Film** > check **Transparent** (essential for RGBA transparent background).
2. Set up three-point studio lighting:
   - Key light (warm, 5500K) at 45° angle.
   - Fill light (soft ambient, 6500K) to lift shadows.
   - Subtle rim light to separate the silhouette from the dark background.

### Step 3: Turntable Animation & Render Settings
1. Set Output Dimensions: **X: 400**, **Y: 480** (Resolution: 100%).
2. In the Timeline, set **Start Frame: 0** and **End Frame: 35** (36 frames total).
3. Select the fruit object:
   - At Frame `0`: Insert Rotation Keyframe (`Z Rotation = 0°`).
   - At Frame `36`: Insert Rotation Keyframe (`Z Rotation = 360°`).
   - In Graph Editor: Set interpolation to **Linear** (`Key > Interpolation Mode > Linear`).
   *(Frames 0 to 35 will render rotations at 0°, 10°, 20°, ... 350°).*
4. Output Format:
   - File Format: **WebP**
   - Color: **RGBA**
   - Quality: **88%**

### Automated Blender Python Script
You can paste this script into Blender's Scripting workspace to automate camera turntable rendering:

```python
import bpy
import math
import os

# Configuration
output_dir = "C:/path/to/renol-foods/public/frames/apple-powder/"
os.makedirs(output_dir, exist_ok=True)

scene = bpy.context.scene
scene.render.resolution_x = 400
scene.render.resolution_y = 480
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.quality = 88

target_obj = bpy.context.active_object  # Select your fruit object first

for i in range(36):
    angle_deg = i * 10
    target_obj.rotation_euler[2] = math.radians(angle_deg)
    scene.render.filepath = os.path.join(output_dir, f"{i:02d}.webp")
    bpy.ops.render.render(write_still=True)

print("360 frame render complete!")
```

---

## 4. Method B: Studio Photography Turntable

If photographing real produce:

### Step 1: Studio Setup
1. **Turntable**: Use a motorized 360° photography turntable with index markings at 10° stops (or a 36-click indexed turntable).
2. **Camera**: Mount camera securely on a rigid tripod.
   - Height: Level or slightly elevated (10°–15° angle).
   - Aperture: `f/8` to `f/11` (for full depth-of-field sharpness from front to back).
   - ISO: `100` (zero sensor noise).
   - Shutter speed: Synced to studio strobes or continuous softboxes.
3. **Lighting**: Even, diffused softboxes on both sides to prevent harsh directional shadows.
4. **Background**: Pure green or solid white backdrop placed 1 meter behind the turntable.

### Step 2: Capture
1. Align the produce at the exact center of rotation so it does not wobble as the turntable rotates.
2. Take 36 photos, rotating the turntable exactly **10 degrees** between each capture.
3. Keep focus, white balance, and exposure locked across all 36 frames.

### Step 3: Batch Alpha Matting & WebP Conversion
1. Remove background so only the produce remains with a clean, smooth alpha edge.
   - Tools: Photoshop Batch Select Subject, Lightroom, or `rembg` AI CLI (`rembg p input_dir output_dir`).
2. Crop and center to 400 × 480 px.
3. Batch convert to WebP using Google's `cwebp` command-line utility:

```bash
# Bash script to convert PNGs to 400x480 WebP at ~15 KB
for i in $(seq -f "%02g" 0 35); do
  cwebp -q 88 -alpha_q 100 -resize 400 480 "raw_${i}.png" -o "${i}.webp"
done
```

---

## 5. Verification & Testing

1. **Verify Asset Naming**: Ensure `/public/frames/<slug>/` contains:
   ```
   00.webp  01.webp  02.webp  03.webp  04.webp  05.webp  06.webp  07.webp
   08.webp  09.webp  10.webp  11.webp  12.webp  13.webp  14.webp  15.webp
   16.webp  17.webp  18.webp  19.webp  20.webp  21.webp  22.webp  23.webp
   24.webp  25.webp  26.webp  27.webp  28.webp  29.webp  30.webp  31.webp
   32.webp  33.webp  34.webp  35.webp
   ```
2. **Enable in `src/data/products.ts`**:
   ```ts
   {
     id: "apple",
     slug: "apple-powder",
     spinFrames: 36,
     framesFolder: "/frames/apple-powder/",
     // ...
   }
   ```
3. **Test in Browser**:
   - Run `astro dev`.
   - Open `http://localhost:4321/`.
   - Rotate the product by dragging with mouse or touch.
   - Verify smooth 36-frame blending and inertia.
   - Click the product to confirm the powder dissolve physics samples the rendered frame pixels.
