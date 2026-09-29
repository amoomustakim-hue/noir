import { CAR, CREDITS } from '../config/film'
import { useScrollTo } from '../hooks/useLenis'

export function Footer() {
  const scrollTo = useScrollTo()
  return (
    <footer className="footer" aria-label="Credits">
      <div className="footer__cta">
        <p className="meta dim">Commission a film like this</p>
        <a className="footer__mail" href={`mailto:${CREDITS.email}?subject=${encodeURIComponent(`${CAR.name} — a project`)}`}>
          Start a project <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className="footer__grid">
        <div>
          <p className="meta dim">Concept, design & development</p>
          <p>
            {CREDITS.author} <span className="dim">({CREDITS.alias})</span>
          </p>
        </div>
        <div>
          <p className="meta dim">Film</p>
          <p>Seven shots, generated with AI, graded and cut for scroll.</p>
        </div>
        <div>
          <p className="meta dim">Note</p>
          <p>
            {CAR.name} is a concept. Not affiliated with Formula 1, the FIA, any team or any sponsor. Marks visible in the footage belong to their
            owners.
          </p>
        </div>
      </div>

      <div className="footer__base">
        <p className="meta dim">
          {CAR.name} {CAR.model} — © {new Date().getFullYear()}
        </p>
        <button className="meta" type="button" onClick={() => scrollTo(0)}>
          Back to the start ↑
        </button>
      </div>
    </footer>
  )
}
