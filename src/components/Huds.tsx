import { useRef } from 'react'
import { REVEAL_SPECS } from '../config/film'
import { clamp, range, smooth } from '../utils/math'
import { useChapterProgress } from './Chapter'

/**
 * The readouts that sit over each shot. Every value is a function of the
 * chapter's scroll progress, written straight to the DOM — no re-renders.
 */

const text = (el: HTMLElement | null, value: string) => {
  if (el && el.textContent !== value) el.textContent = value
}

/** Lights the first `n` children of a light bar. */
const light = (bar: HTMLElement | null, n: number) => {
  bar?.querySelectorAll('i').forEach((el, i) => el.classList.toggle('is-on', i < n))
}

/** 01 — the spec sheet types itself in as the light travels along the car. */
export function SpecsHud() {
  const rows = useRef<(HTMLLIElement | null)[]>([])
  useChapterProgress((p) => rows.current.forEach((el, i) => el?.classList.toggle('is-on', p >= 0.1 + i * 0.17)))
  return (
    <ul className="hud hud--specs">
      {REVEAL_SPECS.map(([k, v], i) => (
        <li
          key={k}
          ref={(el) => {
            rows.current[i] = el
          }}
        >
          <span className="hud__k meta">{k}</span>
          <span className="hud__v">{v}</span>
        </li>
      ))}
    </ul>
  )
}

/** 02 — five red lights, lights out, then a launch timer and speed. */
export function LaunchHud() {
  const lights = useRef<HTMLSpanElement>(null)
  const time = useRef<HTMLSpanElement>(null)
  const speed = useRef<HTMLSpanElement>(null)
  const mark = useRef<HTMLParagraphElement>(null)
  useChapterProgress((p) => {
    const lit = p >= 0.13 ? 0 : Math.min(5, Math.floor(range(p, 0, 0.11) * 5.99))
    light(lights.current, lit)
    const t = range(p, 0.13, 0.95) * 6.4
    const kmh = t <= 0 ? 0 : Math.min(262, 100 * Math.pow(t / 2.6, 0.8))
    text(time.current, t.toFixed(2))
    text(speed.current, String(Math.round(kmh)).padStart(3, '0'))
    mark.current?.classList.toggle('is-on', t >= 2.6)
  })
  return (
    <div className="hud hud--launch">
      <span className="hud__lights" ref={lights} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <i key={i} />
        ))}
      </span>
      <div className="hud__pair">
        <p>
          <span className="hud__big" ref={time}>
            0.00
          </span>
          <span className="hud__unit">s</span>
        </p>
        <p>
          <span className="hud__big" ref={speed}>
            000
          </span>
          <span className="hud__unit">km/h</span>
        </p>
      </div>
      <p className="hud__flag meta" ref={mark}>
        0–100 km/h — 2.6 s
      </p>
    </div>
  )
}

/** 03 — disc temperature climbs with the glow. */
export function BrakesHud() {
  const temp = useRef<HTMLSpanElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  const decel = useRef<HTMLParagraphElement>(null)
  useChapterProgress((p) => {
    const k = smooth(range(p, 0.08, 0.85))
    text(temp.current, Math.round(180 + k * 860).toLocaleString('en-US'))
    if (fill.current) fill.current.style.transform = `scaleX(${k})`
    decel.current?.classList.toggle('is-on', p >= 0.5)
  })
  return (
    <div className="hud hud--brakes">
      <p className="hud__k meta">Carbon disc temperature</p>
      <p>
        <span className="hud__big" ref={temp}>
          180
        </span>
        <span className="hud__unit">°C</span>
      </p>
      <span className="hud__heat" aria-hidden="true">
        <span ref={fill} />
      </span>
      <p className="hud__flag meta" ref={decel}>
        Peak deceleration — 5.2 g
      </p>
    </div>
  )
}

const GEARS = [
  { gear: 6, from: 200, to: 248 },
  { gear: 7, from: 248, to: 296 },
  { gear: 8, from: 296, to: 350 },
]

/** 04 — speed, gear, shift lights and a running lap time, like the wheel in shot. */
export function OnboardHud() {
  const speed = useRef<HTMLSpanElement>(null)
  const gear = useRef<HTMLSpanElement>(null)
  const lights = useRef<HTMLSpanElement>(null)
  const lap = useRef<HTMLSpanElement>(null)
  useChapterProgress((p) => {
    const kmh = 212 + smooth(clamp(p)) * 126 + Math.sin(p * 40) * 2
    const g = GEARS.find((x) => kmh < x.to) ?? GEARS[GEARS.length - 1]
    const rev = clamp((kmh - g.from) / (g.to - g.from))
    text(speed.current, String(Math.round(kmh)))
    text(gear.current, String(g.gear))
    light(lights.current, Math.round(rev * 10))
    const t = 71.418 + p * 9.6
    text(lap.current, `1:${(t - 60).toFixed(3).padStart(6, '0')}`)
  })
  return (
    <div className="hud hud--onboard">
      <span className="hud__shift" ref={lights} aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} />
        ))}
      </span>
      <div className="hud__pair">
        <p>
          <span className="hud__big" ref={speed}>
            212
          </span>
          <span className="hud__unit">km/h</span>
        </p>
        <p className="hud__gear">
          <span className="hud__k meta">Gear</span>
          <span className="hud__big" ref={gear}>
            6
          </span>
        </p>
      </div>
      <p className="hud__k meta">
        Lap 01 — <span ref={lap}>1:11.418</span>
      </p>
    </div>
  )
}

/** 05 — visibility drops as the spray swallows the frame. */
export function RainHud() {
  const vis = useRef<HTMLSpanElement>(null)
  const fill = useRef<HTMLSpanElement>(null)
  useChapterProgress((p) => {
    const v = 100 - smooth(range(p, 0.35, 0.9)) * 96
    text(vis.current, String(Math.round(v)))
    if (fill.current) fill.current.style.transform = `scaleX(${v / 100})`
  })
  return (
    <div className="hud hud--rain">
      <p className="hud__k meta">Track — Wet / Air 14 °C</p>
      <p>
        <span className="hud__big" ref={vis}>
          100
        </span>
        <span className="hud__unit">% visibility</span>
      </p>
      <span className="hud__meter" aria-hidden="true">
        <span ref={fill} />
      </span>
    </div>
  )
}

/** 06 — resting heart rate to race pace. */
export function PulseHud() {
  const bpm = useRef<HTMLSpanElement>(null)
  const line = useRef<SVGSVGElement>(null)
  useChapterProgress((p) => {
    const b = Math.round(62 + smooth(range(p, 0.05, 0.9)) * 112)
    text(bpm.current, String(b))
    line.current?.style.setProperty('--beat', `${(60 / b).toFixed(3)}s`)
  })
  return (
    <div className="hud hud--pulse">
      <p className="hud__k meta">Driver — heart rate</p>
      <p>
        <span className="hud__big" ref={bpm}>
          62
        </span>
        <span className="hud__unit">bpm</span>
      </p>
      <svg className="hud__ecg" ref={line} viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="0,24 60,24 70,24 76,8 82,36 88,18 94,24 200,24" />
      </svg>
    </div>
  )
}
