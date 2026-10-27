# Signal. Surface. Sound.

[Editable Figma studies](https://www.figma.com/design/syEKwt96OJL5sRyae8Wp0X?node-id=2-17) define the project direction: three signal fields, four ceramic finishes, and three distinct record covers. The file contains Anton and DM Sans text, vector artwork, color variables and a shared selector component; no complete-screen raster is used.

The selected treatments preserve each project's established palette and typography. Orbit uses restrained signal contours and matte rings; Form & Field uses warm studio lighting and grounded vessels; Good Noise uses ribbons, a breathing rosette and an angular signal with record-specific typography and rhythms.

## Native Figma shader

`orbit-signal-field.ts` is the complete source of **Orbit · Signal field**, a Figma shader **fill**. It was built as resource `fd61f95f-20e4-414c-a704-8b72bacdebbf`, version `721e3db1cd27c3bf4179705f33ac64320cf5f925`.

[Try the native shader in Figma](https://www.figma.com/file/new?try-tool-resource-content-id=fd61f95f-20e4-414c-a704-8b72bacdebbf&try-tool-resource-type=gen_fill&type=design&mode=design).

[Native shader and material proofs](https://www.figma.com/design/syEKwt96OJL5sRyae8Wp0X?node-id=5-59) apply all three shader modes, native Glass, Texture, Noise and progressive background blur in the Design file.

Controls: Wave / Orbit / Interference, tempo, pointer-lens strength, deep blue and lime. The successful account-library build accepts animated and pointer-responsive capabilities; interactive rendering still depends on the Figma client and its graphics support.

## Production translation

The website uses independently authored GLSL and Three.js, with a matching Canvas alternative. These are browser translations of the visual direction; native Figma shaders and glass effects are not exported into the site.

Ceramics use local procedural bump texture, finish-specific roughness and clearcoat, local lighting, softened contact shadows and interpolated background colors. CSS backdrop blur and a shallow gradient blur form the control material, with a solid fallback.

Good Noise binds the selected record to vector layers, text, layout, colors, optional audio and motion rhythm. Its vectors remain inline SVG. Rive and Spline are external tools, and neither an external authoring connection nor a `.riv` or Spline asset was available. The site therefore has no Rive/Spline runtime dependency.

The account reports Code Layers enabled. `.figma/make/` contains the lifecycle scripts for a runnable prototype of the same Vite/JavaScript source. The attempted prototype upload failed to connect to the workspace proxy. No runnable Code Layer was imported, and no Figma preview was verified.

## Lifecycle and access

All project controls use native buttons and sliders with accessible names and selected states. Reduced motion starts still and disables automatic transitions. Motion can be explicitly enabled. Project clocks stop scheduling while paused, offscreen or hidden. Opening Orbit or Form & Field imports graphics lazily unless Save-Data is enabled; closing releases contexts, geometry, materials, textures, observers, listeners and audio. Context loss returns Orbit to its Canvas renderer.
