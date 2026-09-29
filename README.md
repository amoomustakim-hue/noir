# NOIR — N/01

A concept film in seven shots, told by scrolling. Each shot pins to the
screen and the scroll position becomes the playhead: scroll down and the car
launches, scroll back and it rolls back onto the grid.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build → dist/
npm run preview
```

Deploys to Vercel as-is (`vercel.json` sets the Vite build and cache headers).

## The film

| # | Shot | On screen |
| --- | --- | --- |
| — | Trailer | The joined cut, full-bleed and looping, sound on request |
| 01 | Reveal | Strip light along the car; the spec sheet types itself in |
| 02 | Launch | Five red lights, lights out, a launch timer and speed |
| 03 | Heat | Brake discs glowing; disc temperature climbs with them |
| 04 | Onboard | Speed, gear, shift lights and a running lap time |
| 05 | Rain | The pass; visibility drops as the spray fills the frame |
| 06 | Driver | The helmet; heart rate from resting to race pace |
| — | In numbers | The figures, counted up |
| 07 | Night | The tunnel; the wordmark returns as the light fades |

## Footage

Sources go in `media-src/` (not committed):

| File | Shot |
| --- | --- |
| `joined.mp4` | Trailer, and the tunnel (its last shot) |
| `reveal.mp4`, `launch.mp4`, `brakes.mp4`, `onboard.mp4`, `rain.mp4`, `helmet.mp4` | One shot each |

`npm run media` (or `npm run media -- launch` for one) trims, grades and
encodes them into `public/media/`: 1080p for desktop, 720p for phones, VP9
fallbacks, and a poster frame each. The in/out points and their reasons are in
`scripts/prepare-media.mjs`. Scrubbed clips get a keyframe every 12 frames and
no B-frames, so seeking stays instant in both directions.

## Structure

```
src/
  config/film.ts     chapters: copy, readout, scroll length, phone framing
  config/media.ts    which encode to load
  components/
    Preloader · Nav · Hero (trailer) · Chapter · Huds · Numbers · Footer
  hooks/             useScrollScene (scoped gsap.matchMedia), Lenis
  styles/
```

## Access

- `prefers-reduced-motion` turns off smooth scrolling, pinning and playback:
  each chapter becomes a still with its copy and final readings.
- Phones get 720p encodes; wide shots keep the full frame in a letterboxed band.
- Skip link, keyboard-operable chapter rail, visible focus.

NOIR is a concept. Not affiliated with Formula 1, the FIA, any team or any
sponsor.
