#!/usr/bin/env node
/**
 * Prepares the NOIR footage for the web.
 *
 *   npm run media            # all clips
 *   npm run media -- launch  # one clip
 *
 * Sources live in media-src/ (not committed). Writes to public/media/:
 *   {clip}.mp4 / .webm       desktop, 1920 × 1080
 *   {clip}-m.mp4 / .webm     phones, 1280 × 720
 *   {clip}.jpg               first frame, shown until the video can play
 *   og.jpg                   social card
 *
 * Scroll-driven clips are encoded with a keyframe every 12 frames and no
 * B-frames, so seeking backwards and forwards stays instant. Every clip gets
 * the same light grade so the seven shots read as one film.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpeg from 'ffmpeg-static'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = (f) => resolve(root, 'media-src', f)
const out = resolve(root, 'public/media')
mkdirSync(out, { recursive: true })

// The common look: a touch more contrast, a touch less colour. Brighter
// shots get pulled down to sit with the reveal.
const LOOK = 'eq=contrast=1.04:saturation=0.92'

/**
 * in/out points come from scene detection on each source:
 *   launch  — ends once the rain light is gone (last ~1 s is empty track)
 *   brakes  — the tyre stripe turns from yellow to red at 8.3 s
 *   rain    — hard cuts at 4.5 s and 6.0 s; the pass itself is the last shot
 *   helmet  — the studio light jumps at 8.5 s
 *   tunnel  — the last shot of the joined trailer (cut at 7.79 s), slowed 2×
 */
const CLIPS = {
  trailer: { file: 'joined.mp4', audio: true },
  reveal: { file: 'reveal.mp4' },
  launch: { file: 'launch.mp4', to: 9 },
  brakes: { file: 'brakes.mp4', to: 8.2, grade: 'eq=brightness=-0.035:contrast=1.06' },
  onboard: { file: 'onboard.mp4' },
  rain: { file: 'rain.mp4', from: 6.05 },
  helmet: { file: 'helmet.mp4', to: 8.4, grade: 'eq=brightness=-0.03' },
  tunnel: { file: 'joined.mp4', from: 7.84, slow: 2 },
}

const only = process.argv[2]
const run = (args) => {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

for (const [name, clip] of Object.entries(CLIPS)) {
  if (only && only !== name) continue
  const input = src(clip.file)
  if (!existsSync(input)) {
    console.error(`missing ${input}`)
    process.exit(1)
  }
  const trim = [...(clip.from ? ['-ss', String(clip.from)] : []), ...(clip.to ? ['-to', String(clip.to)] : [])]
  const pre = [
    LOOK,
    clip.grade,
    // Motion-interpolated slow motion, so a short shot can carry a longer scroll.
    clip.slow && `minterpolate=fps=${24 * clip.slow}:mi_mode=mci:mc_mode=aobmc:vsbmc=1,setpts=${clip.slow}*PTS,fps=24`,
  ].filter(Boolean)
  const desktop = [...pre, 'scale=1920:1080:flags=lanczos', 'unsharp=5:5:0.5:5:5:0'].join(',')
  const mobile = [...pre, 'scale=1280:720:flags=lanczos', 'unsharp=3:3:0.3:3:3:0'].join(',')

  // The trailer autoplays and loops, with sound on request; the rest are scrubbed.
  const gop = clip.audio ? ['-g', '48'] : ['-g', '12', '-bf', '0']
  const h264 = ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '24', '-preset', 'slow', '-tune', 'film', ...gop, '-movflags', '+faststart']
  const vp9 = ['-c:v', 'libvpx-vp9', '-b:v', '0', '-r', '24', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '3', '-g', clip.audio ? '48' : '12']
  const aac = clip.audio ? ['-c:a', 'aac', '-b:a', '128k'] : ['-an']
  const opus = clip.audio ? ['-c:a', 'libopus', '-b:a', '96k'] : ['-an']

  console.log(`→ ${name}`)
  run([...trim, '-i', input, ...h264, '-crf', '21', ...aac, '-vf', desktop, `${out}/${name}.mp4`])
  run([...trim, '-i', input, ...h264, '-crf', '24', ...aac, '-vf', mobile, `${out}/${name}-m.mp4`])
  run([...trim, '-i', input, ...vp9, '-crf', '33', ...opus, '-vf', desktop, `${out}/${name}.webm`])
  run([...trim, '-i', input, ...vp9, '-crf', '36', ...opus, '-vf', mobile, `${out}/${name}-m.webm`])
  run(['-i', `${out}/${name}-m.mp4`, '-frames:v', '1', '-q:v', '4', `${out}/${name}.jpg`])

  for (const f of [`${name}.mp4`, `${name}-m.mp4`, `${name}.webm`, `${name}-m.webm`]) {
    console.log(`  ${f}: ${(statSync(`${out}/${f}`).size / 1e6).toFixed(1)} MB`)
  }
}

if (!only || only === 'og') {
  console.log('→ og.jpg')
  run(['-ss', '4.4', '-i', src('launch.mp4'), '-frames:v', '1', '-q:v', '3', '-vf', `${LOOK},scale=1200:-2:flags=lanczos,crop=1200:630`, `${out}/og.jpg`])
}
