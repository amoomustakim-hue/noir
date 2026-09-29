import { useSyncExternalStore } from 'react'
import { CHAPTERS } from '../config/film'

/**
 * Which chapter is on screen, for the navigation: the last chapter whose top
 * has passed the middle of the viewport (-1 while on the trailer). Read from
 * layout on scroll rather than from trigger callbacks, so long jumps (the
 * rail, the back-to-top button) can never leave it stale.
 */
let active = -1
const listeners = new Set<() => void>()
let frame = 0

function measure() {
  frame = 0
  const mid = window.innerHeight * 0.5
  let next = -1
  CHAPTERS.forEach((c, i) => {
    const el = document.getElementById(c.id)
    // A pinned chapter lives inside a spacer that carries its full scroll length.
    const box = el?.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
    if (box && box.getBoundingClientRect().top <= mid) next = i
  })
  if (next !== active) {
    active = next
    listeners.forEach((fn) => fn())
  }
}

const schedule = () => {
  if (!frame) frame = requestAnimationFrame(measure)
}

export const useActiveChapter = () =>
  useSyncExternalStore(
    (fn) => {
      if (!listeners.size) {
        window.addEventListener('scroll', schedule, { passive: true })
        window.addEventListener('resize', schedule)
        schedule()
      }
      listeners.add(fn)
      return () => {
        listeners.delete(fn)
        if (!listeners.size) {
          window.removeEventListener('scroll', schedule)
          window.removeEventListener('resize', schedule)
        }
      }
    },
    () => active,
    () => -1,
  )
