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

The twelve Playwright checks cover horizontal wheel/button/keyboard navigation, every project modal, focus restoration, direct project links and browser Back, about/contact navigation, clipboard copying, reduced motion and animation pause, mobile layout, and the absence of external runtime asset requests or browser errors. Additional demo checks exercise every control at desktop and mobile sizes, and verify reduced-motion behavior.

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
- Good Noise: three visual record designs, spinning vinyl, animated meter, and play/pause. This visual player does not play audio.

Gallery previews animate only while visible. Demo animation stops when out of view or when the browser tab is hidden. Closing or replacing a case study removes observers, listeners, and its animation loop. Reduced motion starts demos paused; an explicit play action can enable motion. Projects remain clearly labeled self-initiated concepts.

## Signature experience

The homepage includes a real, draggable chrome sculpture rendered with Three.js. Its lighting environment is generated locally, so there are no external textures or models. The 3D module loads separately, when the hero is visible and the browser is idle. It stays unloaded for direct project views and data-saver connections. Pixel ratio and frame rate are capped; rendering pauses off-screen, in background tabs, and when motion is paused. Reduced motion renders a static composition. The original Canvas playground remains available if WebGL fails.

`src/experience.js` and `src/experience.css` provide the entrance typography, moving ribbon, pointer-driven project tilt, contextual cursor hint, and preview-to-demo flight. All decorative overlays ignore pointer input; closing a project cancels its transition immediately. Reduced motion skips entrance and flight animations.
