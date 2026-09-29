import { useEffect, useRef, useState } from 'react'
import { CAR, CHAPTERS } from '../config/film'
import { useReducedMotion } from '../hooks/useMediaQuery'
import { useScrollScene } from '../hooks/useScrollScene'
import { useScrollTo } from '../hooks/useLenis'
import { gsap } from '../utils/gsap'
import { FilmVideo } from './FilmVideo'
import { SplitChars } from './SplitChars'

/**
 * The trailer: the joined cut plays full-bleed on a loop, with sound on
 * request, under the wordmark. Scrolling pushes it back into the dark.
 */
export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const intro = useRef<gsap.core.Timeline | null>(null)
  const readyRef = useRef(ready)
  readyRef.current = ready
  const [sound, setSound] = useState(false)
  const reduced = useReducedMotion()
  const scrollTo = useScrollTo()

  useScrollScene(root, ({ motion }) => {
    if (!motion) return
    const tl = gsap
      .timeline({ paused: true, defaults: { ease: 'expo.out' } })
      .fromTo('.hero__media video', { scale: 1.18 }, { scale: 1, duration: 2.6 }, 0)
      .fromTo('.hero__mark .char', { yPercent: 110 }, { yPercent: 0, duration: 1.8, stagger: 0.07 }, 0.15)
      .fromTo('.hero__rise', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.7)
    intro.current = tl
    if (readyRef.current) tl.progress(1)

    gsap
      .timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          // Leaving the trailer mutes it: sound belongs to this frame only.
          onLeave: () => {
            const v = video.current
            if (v && !v.muted) {
              v.muted = true
              setSound(false)
            }
          },
        },
      })
      .to('.hero__media', { scale: 0.9, opacity: 0.25 }, 0)
      .to('.hero__mark', { yPercent: -35 }, 0)
      .to('.hero__foot', { opacity: 0 }, 0)
  })

  useEffect(() => {
    if (ready) intro.current?.play()
  }, [ready])

  const toggleSound = () => {
    const v = video.current
    if (!v) return
    v.muted = !v.muted
    if (v.paused) v.play().catch(() => {})
    setSound(!v.muted)
  }

  return (
    <section className="hero" id="top" ref={root} aria-label={`${CAR.name} ${CAR.model} — trailer`}>
      <div className="hero__media">
        <FilmVideo ref={video} clip="trailer" mode={reduced ? 'still' : 'autoplay'} />
        <div className="hero__shade" />
      </div>

      <div className="hero__top">
        <p className="meta hero__rise">
          {CAR.model} — A concept film in {CHAPTERS.length} shots
        </p>
        {!reduced && (
          <button className="meta hero__rise hero__sound" type="button" onClick={toggleSound} aria-pressed={sound}>
            <span className={`eq ${sound ? 'is-on' : ''}`} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            Sound {sound ? 'on' : 'off'}
          </button>
        )}
      </div>

      <h1 className="hero__mark">
        <SplitChars text={CAR.name} />
      </h1>

      <div className="hero__foot">
        <p className="hero__tag hero__rise">
          Built in the dark.
          <br />
          <span className="dim">Driven into the night.</span>
        </p>
        <button className="meta hero__rise hero__cue" type="button" onClick={() => scrollTo(CHAPTERS[0].id)}>
          Scroll to ignite <span aria-hidden="true">↓</span>
        </button>
      </div>
    </section>
  )
}
