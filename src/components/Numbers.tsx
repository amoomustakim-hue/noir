import { useRef } from 'react'
import { CAR, NUMBERS } from '../config/film'
import { useScrollScene } from '../hooks/useScrollScene'
import { gsap } from '../utils/gsap'
import { SplitChars } from './SplitChars'

const format = (v: number, decimals = 0) => v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

/** The figures, counted up as they arrive. */
export function Numbers() {
  const root = useRef<HTMLElement>(null)

  useScrollScene(root, ({ motion }) => {
    if (!motion) return
    gsap.fromTo(
      '.numbers__head .char',
      { yPercent: 110 },
      { yPercent: 0, duration: 1.3, stagger: 0.02, ease: 'expo.out', scrollTrigger: { trigger: '.numbers__head', start: 'top 80%' } },
    )
    gsap.utils.toArray<HTMLElement>('.numbers__item').forEach((el, i) => {
      const out = el.querySelector<HTMLElement>('.numbers__value')!
      const fig = NUMBERS[i]
      const state = { v: 0 }
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: 'top 88%' } })
        .fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: (i % 3) * 0.08 }, 0)
        .fromTo(el.querySelector('.numbers__rule'), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, 0)
        .to(state, { v: fig.value, duration: 1.6, ease: 'power3.out', onUpdate: () => (out.textContent = format(state.v, fig.decimals)) }, 0.1)
    })
  })

  return (
    <section className="numbers" id="numbers" ref={root} aria-label="Technical figures">
      <header className="numbers__head">
        <p className="meta">
          <span className="accent">{CAR.model}</span> — Technical
        </p>
        <h2>
          <SplitChars text="In numbers." />
        </h2>
      </header>
      <ol className="numbers__grid">
        {NUMBERS.map((n) => (
          <li className="numbers__item" key={n.label}>
            <span className="numbers__rule" aria-hidden="true" />
            <p className="meta dim">{n.label}</p>
            <p className="numbers__figure">
              <span className="numbers__value">{format(n.value, n.decimals)}</span>
              {n.suffix}
              <span className="numbers__unit">{n.unit}</span>
            </p>
          </li>
        ))}
      </ol>
      <p className="numbers__note meta dim">Concept figures, in the range of a modern single-seater.</p>
    </section>
  )
}
