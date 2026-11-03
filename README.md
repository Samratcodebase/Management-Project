# Neo-Classical Approach — React presentation

A React + Vite migration of the original 15-slide presentation. The original slide copy, ordering, visual design, and animation choreography are preserved.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Performance and lifecycle work

- Each of the 15 slides is rendered as a React `Slide` component; the original slide HTML and copy are preserved.
- React controls the app mount/unmount lifecycle.
- The original presentation engine is loaded after the slide markup is mounted.
- Event listeners are registered with an `AbortController` and removed on teardown.
- Pending timers and the canvas particle animation are stopped on teardown.
- The embedded font is now a separately cacheable WOFF asset instead of being inlined in CSS.
- Vite production builds bundle/minify the app and emit fingerprinted assets.

## Preservation note

The original presentation markup and slide content are intentionally not rewritten. The animation engine remains imperative because it directly choreographs the existing DOM; rewriting that choreography into React state would add regression risk without improving runtime performance. The React boundary and engine lifecycle are separated so a future component-by-component rewrite can be tested without changing the source presentation content.
