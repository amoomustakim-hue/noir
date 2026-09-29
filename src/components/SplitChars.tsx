import { Fragment } from 'react'

/**
 * Splits text into masked characters, grouped per word so lines only break
 * between words. The whole string stays readable to assistive tech.
 */
export function SplitChars({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <span className={`split ${className}`} aria-label={text}>
      {words.map((word, w) => (
        <Fragment key={w}>
          <span className="word" aria-hidden="true">
            {[...word].map((ch, i) => (
              <span className="char-mask" key={i}>
                <span className="char">{ch}</span>
              </span>
            ))}
          </span>
          {w < words.length - 1 && ' '}
        </Fragment>
      ))}
    </span>
  )
}
