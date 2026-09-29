import { useEffect, useRef, useState } from 'react'
import { CAR } from '../config/film'
import { posterSrc } from '../config/media'
import { gsap } from '../utils/gsap'
import { pad } from '../utils/math'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * A counter driven by real loading (fonts, the trailer's first frame), then
 * a single strip light sweeps across and the curtain splits open around it.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const state = { v: 0 }
    let target = 0.12
    let finished = false
    const bump = (to: number) => (target = Math.max(target, to))

    const fonts = Promise.race([document.fonts.ready, wait(2500)]).then(() => bump(0.45))
    const img = new Image()
    img.src = posterSrc('trailer')
    const poster = img
      .decode()
      .catch(() => {})
      .then(() => bump(0.8))
    Promise.all([fonts, poster, wait(reduced ? 200 : 1400)]).then(() => bump(1))
    const failsafe = window.setTimeout(() => bump(1), 6000)

    const finish = () => {
      finished = true
      gsap.ticker.remove(tick)
      if (reduced) {
        onDone()
        gsap.to(root.current, { opacity: 0, duration: 0.4, onComplete: () => setGone(true) })
        return
      }
      gsap
        .timeline({ onComplete: () => setGone(true) })
        .to('.pre__count, .pre__label', { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0)
        .fromTo('.pre__strip', { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'expo.inOut' }, 0.1)
        .add(onDone, 0.95)
        .to('.pre__half--top', { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, 0.95)
        .to('.pre__half--bottom', { yPercent: 100, duration: 1.2, ease: 'expo.inOut' }, 0.95)
        .to('.pre__strip', { opacity: 0, duration: 0.6 }, 1.2)
    }

    const tick = () => {
      state.v += (target - state.v) * 0.1
      if (num.current) num.current.textContent = pad(state.v * 100, 3)
      if (!finished && target === 1 && state.v > 0.995) finish()
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      window.clearTimeout(failsafe)
    }
  }, [onDone])

  if (gone) return null
  return (
    <div className="pre" ref={root} aria-hidden="true">
      <div className="pre__half pre__half--top" />
      <div className="pre__half pre__half--bottom" />
      <span className="pre__strip" />
      <p className="pre__label meta">
        {CAR.name} — {CAR.model}
      </p>
      <p className="pre__count">
        <span ref={num}>000</span>
      </p>
    </div>
  )
}
