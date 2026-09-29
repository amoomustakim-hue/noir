import { CAR, CHAPTERS } from '../config/film'
import { useScrollTo } from '../hooks/useLenis'
import { useActiveChapter } from '../utils/chapterStore'
import { pad } from '../utils/math'

/** Wordmark, the shot on screen, and a rail of the seven chapters. */
export function Nav() {
  const active = useActiveChapter()
  const scrollTo = useScrollTo()
  const current = CHAPTERS[active]

  return (
    <>
      <header className="nav">
        <button className="nav__mark" type="button" onClick={() => scrollTo(0)} aria-label="Back to the trailer">
          {CAR.name}
        </button>
        <p className="nav__now meta" aria-live="polite">
          {current ? (
            <>
              <span className="accent">{pad(active + 1)}</span> — {current.label}
            </>
          ) : (
            <>{CAR.model} — Trailer</>
          )}
        </p>
        <button className="nav__link meta" type="button" onClick={() => scrollTo('numbers')}>
          Specs
        </button>
      </header>

      <nav className={`rail ${active < 0 ? 'is-idle' : ''}`} aria-label="Chapters">
        <ol>
          {CHAPTERS.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                className={`rail__item ${i === active ? 'is-active' : ''} ${i < active ? 'is-past' : ''}`}
                onClick={() => scrollTo(c.id)}
                aria-label={`${pad(i + 1)} — ${c.label}`}
                aria-current={i === active ? 'step' : undefined}
              >
                <span className="meta">{pad(i + 1)}</span>
                <i />
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
