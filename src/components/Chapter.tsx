import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { CAR, type ChapterData } from '../config/film'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { useScrollScene } from '../hooks/useScrollScene'
import { gsap } from '../utils/gsap'
import { pad } from '../utils/math'
import { FilmVideo } from './FilmVideo'
import { SplitChars } from './SplitChars'

type Listener = (p: number) => void
const ProgressContext = createContext<Set<Listener>>(new Set())

/** Runs `fn` with the chapter's scroll progress (0 → 1) on every update. */
export function useChapterProgress(fn: Listener) {
  const set = useContext(ProgressContext)
  const cb = useRef(fn)
  cb.current = fn
  // Layout effect: children register before the chapter builds its scene and emits the first value.
  useLayoutEffect(() => {
    const wrapped: Listener = (p) => cb.current(p)
    set.add(wrapped)
    return () => {
      set.delete(wrapped)
    }
  }, [set])
}

type Props = { data: ChapterData; index: number; total: number; children?: ReactNode }

/**
 * One shot of the film. The chapter pins, and scroll becomes the playhead:
 * progress drives the footage's currentTime, the title hands over to the
 * lede, and the readouts (children) follow along.
 */
export function Chapter({ data, index, total, children }: Props) {
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const [listeners] = useState(() => new Set<Listener>())
  const reduced = useReducedMotion()

  useScrollScene(root, ({ motion, desktop }) => {
    const emit = (p: number) => {
      listeners.forEach((fn) => fn(p))
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
    }
    if (!motion) {
      emit(1)
      return
    }

    const v = video.current
    const state = { target: 0, current: 0 }
    // Ease the playhead toward the scroll position; only seek when the
    // decoder is free, so fast scrolling never queues a backlog of seeks.
    const seek = () => {
      if (!v || !v.duration) return
      state.current += (state.target - state.current) * 0.14
      const t = Math.min(v.duration - 0.05, state.current * v.duration)
      if (!v.seeking && Math.abs(v.currentTime - t) > 1 / 60) v.currentTime = t
    }

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: root.current,
        start: 'top top',
        end: `+=${desktop ? data.length : Math.round(data.length * 0.8)}%`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: (self) => {
          state.target = self.progress
          emit(self.progress)
        },
        onToggle: (self) => {
          if (self.isActive) gsap.ticker.add(seek)
          else gsap.ticker.remove(seek)
        },
      },
    })
    tl.fromTo('.chapter__media', { scale: 1.07 }, { scale: 1, duration: 1 }, 0)
    tl.to('.chapter__title', { yPercent: -30, opacity: 0, duration: 0.1, ease: 'power2.in' }, data.finale ? 0.3 : 0.4)
    if (data.lede) tl.fromTo('.chapter__lede', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.48)
    if (data.finale) {
      tl.fromTo('.chapter__finale .char', { yPercent: 110 }, { yPercent: 0, duration: 0.18, stagger: 0.025, ease: 'power3.out' }, 0.55)
      tl.fromTo('.chapter__finale-sub', { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.72)
    }
    tl.set({}, {}, 1)

    // The title arrives as the chapter slides in, before it pins.
    gsap.fromTo(
      '.chapter__title .char',
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 1.2,
        stagger: 0.025,
        ease: 'expo.out',
        scrollTrigger: { trigger: root.current, start: 'top 45%', toggleActions: 'play none none reverse' },
      },
    )

    emit(0)
    return () => gsap.ticker.remove(seek)
  })

  return (
    <section
      className={`chapter chapter--${data.id} chapter--phone-${data.phone} ${data.finale ? 'chapter--finale' : ''}`}
      id={data.id}
      ref={root}
      aria-label={`${pad(index + 1)} — ${data.label}`}
    >
      <div className="chapter__frame">
        <FilmVideo ref={video} clip={data.id} mode={reduced ? 'still' : 'scrub'} className="chapter__media" style={{ ['--focus' as string]: data.focus ?? '50% 50%' }} />
        <div className="chapter__shade" />
      </div>

      <p className="chapter__index meta">
        <span className="accent">{pad(index + 1)}</span> / {pad(total)} — {data.label}
      </p>

      <div className="chapter__copy">
        <h2 className="chapter__title">
          <SplitChars text={data.title[0]} className="chapter__line" />
          <SplitChars text={data.title[1]} className="chapter__line" />
        </h2>
        {data.lede && <p className="chapter__lede">{data.lede}</p>}
      </div>

      {data.finale && (
        <div className="chapter__finale">
          <p className="chapter__finale-mark">
            <SplitChars text={CAR.name} />
          </p>
          <p className="chapter__finale-sub meta">{CAR.model} — Built in the dark</p>
        </div>
      )}

      <ProgressContext.Provider value={listeners}>{children}</ProgressContext.Provider>

      <span className="chapter__bar" aria-hidden="true">
        <span ref={bar} />
      </span>
    </section>
  )
}
