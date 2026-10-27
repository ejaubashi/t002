# Endy J — creative portfolio

A complete responsive portfolio inspired by the interaction and layout of patrickheng.com: a fullscreen orange Canvas playground, horizontal project gallery, outlined project titles, project detail overlays, and a separate purple about experience. On phones, content flows vertically with native scrolling.

The implementation uses original code and CSS-generated project artwork. The portfolio uses the name “Endy J.” The biography is suggested copy; all four projects are self-initiated concepts. The contact address is `endyj@dev.com`.

## Develop

Requires Node.js 20.19+ or 22.12+ (tested on 24.19).

```sh
cd /workspace/t002
npm ci --cache /tmp/t002-npm-cache --no-audit --no-fund
npm run dev
```

## Build and validate

```sh
npm run build
npm test
```

The sixteen Playwright checks cover horizontal wheel/button/keyboard navigation, every project modal, focus restoration, direct project links and browser Back, about/contact navigation, clipboard copying, reduced motion and animation pause, mobile layout, and the absence of external runtime asset requests or browser errors. Additional demo checks exercise every control at desktop and mobile sizes, and verify reduced-motion behavior.

Tests use the system Chromium at `/usr/bin/chromium` when available. On another machine, install a Playwright browser using `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to your Chromium executable. The test runner starts the dev server if needed.

To serve the production output:

```sh
npm run preview
```

## Make it yours

- Update the profile name, email, and project details in `src/data.js`. The email is shared by the contact links and clipboard control.
- Update the homepage title, page metadata, biography, and colophon in `index.html` to match your identity.
- Edit `src/artwork.js` to replace the original concept illustrations with your own project media. The preview and detail view share the same artwork.
- Edit the colors and layout in `src/style.css` and the animated background in `src/playground.js`.

The project gallery and archive both open detailed case studies. `#project/orbit`, `#project/form-and-field`, `#project/offgrid`, and `#project/good-noise` can be shared directly. `#about`, `#bio`, and `#contact` link to the about sections. These hash routes work on a static host without rewrite configuration.

No backend, API key, or external image/font service is required. Anton and DM Sans are bundled locally through their Fontsource packages. The included concept projects are not live shops or client websites. 

## GitHub Pages deployment

The Vite build uses relative asset URLs, so the site works under `/t002/` and on a custom domain. The `Publish portfolio` workflow rebuilds the site, uploads a Pages artifact, and deploys it with GitHub’s official Pages actions after changes to `main`.

In the repository's **Settings → Pages**, select **GitHub Actions** as the source. The expected URL is `https://ejaubashi.github.io/t002/`; it becomes live after GitHub finishes the Pages deployment.

## Interactive concept demos

Every case study contains an original live demo, implemented in `src/demos.js` and `src/demos.css`:

- Orbit: pointer-reactive Canvas visualizer, tempo slider, shape remix, and play/pause.
- Form & Field: four ceramic finishes and keyboard-accessible rotation controls.
- Offgrid: time-of-day slider, dawn/day/dusk/night presets, and pointer parallax.
- Good Noise: three visual record designs, spinning vinyl, animated meter, and play/pause. Sound is off by default. An explicit Enable sound action starts quiet, original synthesized chords; muting, backgrounding the tab, or closing the case study silences them.

Gallery previews animate only while visible. Demo animation stops when out of view or when the browser tab is hidden. Closing or replacing a case study removes observers, listeners, and its animation loop. Reduced motion starts demos paused; an explicit play action can enable motion. Projects remain clearly labeled self-initiated concepts.

## Project 3D treatment

The original orange homepage, circle playground, and typography are preserved. No 3D module is loaded on the homepage.

The Orbit case study has slim, matte lime 3D orbital rings against its blue visualizer background. Its existing tempo, remix, pointer and pause controls also operate the 3D scene. Form & Field uses actual hollow 3D ceramic vessels; its finish and turn controls update the materials and geometry orientation. Other project demos retain their original art direction.

The Three.js module loads only when opening a supported project. Lighting is local and procedural; there are no remote models or textures. Rendering is capped and pauses when hidden. Reduced motion starts still. All GPU resources and observers are released when closing or replacing a project; the previous Canvas/CSS illustrations remain usable when WebGL is unavailable.

`src/experience.js` and `src/experience.css` limit preview tilt, cursor hints, and transitions to project content. They do not change the homepage.

## Art direction update

The homepage files and behavior are preserved. Orbit has three shader-backed compositions: Wave, Orbit, and Interference. The 3D rings, particle positions and procedural field share mode controls, with a pointer distortion region. A Canvas fallback supports the same modes. Shader sources live in `src/orbit-shaders.js`.

Form & Field has procedural ceramic bump texture, subtle clearcoat, real contact shadows, finish-dependent roughness, smooth material-color transitions, coordinated background tones and a translucent, blurred control surface. Reduced motion makes finish changes immediate.

Good Noise has three original SVG compositions driven by the selected-record state, including matching typography and layout changes. Motion is controlled by the existing play/pause preference. `src/record-artwork.js` contains the vectors; `src/record-audio.js` contains optional generated audio.

[Editable Figma studies](https://www.figma.com/design/syEKwt96OJL5sRyae8Wp0X?node-id=2-17) now define the project direction. A custom animated, pointer-responsive Figma shader fill was authored and built in the connected account. See [design/README.md](design/README.md) for the native shader source, try link, visual choices, capability boundaries and browser translation. The website still uses local browser shaders, CSS and SVG; no Figma, Rive or Spline account is required to view it.

Project clocks now stop scheduling while paused, hidden or offscreen. Static ceramics stop rendering after material changes settle. Good Noise crossfades persistent vector layers and gives each record its own movement and rhythm. Audio starts disabled on every open and is created only after an explicit sound action. Its asynchronous activation cannot undo a newer mute or visibility change.

The project lifecycle tests additionally cover desktop/mobile GPU pause and resumption, offscreen behavior, context loss and Canvas recovery, context release, ceramic settling, changed motion preferences, 320px controls, all record states, and audio defaults after reopening. Run `npm test` for the complete suite.
