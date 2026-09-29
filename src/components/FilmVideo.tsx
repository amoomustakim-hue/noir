import { useEffect, useRef, useState, type CSSProperties, type Ref } from 'react'
import { clipSrc, posterSrc, type ClipKey } from '../config/media'

type Mode =
  /** Loads straight away and loops; pauses while off-screen. */
  | 'autoplay'
  /** Attaches well before it reaches the viewport, never plays on its own; the owner drives currentTime. */
  | 'scrub'
  /** Just the first frame (reduced motion). */
  | 'still'

type Props = {
  clip: ClipKey
  mode: Mode
  className?: string
  style?: CSSProperties
  ref?: Ref<HTMLVideoElement>
}

export function FilmVideo({ clip, mode, className, style, ref }: Props) {
  const local = useRef<HTMLVideoElement | null>(null)
  const [attached, setAttached] = useState(mode === 'autoplay')
  const [src] = useState(() => clipSrc(clip))

  const setRef = (el: HTMLVideoElement | null) => {
    local.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) ref.current = el
  }

  useEffect(() => {
    const video = local.current
    if (!video) return
    // React doesn't reflect `muted` as an attribute; iOS needs it to allow inline playback.
    video.muted = true
    video.defaultMuted = true
    video.setAttribute('muted', '')

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAttached(true)
          if (mode === 'autoplay' && video.currentSrc) video.play().catch(() => {})
        } else if (!video.paused) {
          video.pause()
        }
      },
      { rootMargin: mode === 'scrub' ? '150% 0px' : '0px' },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [mode])

  // iOS Safari never decodes a frame for a video that has not played, so a
  // scrub-only video would stay black: play once, then hand it back paused.
  useEffect(() => {
    const video = local.current
    if (mode !== 'scrub' || !attached || !video) return
    video
      .play()
      .then(() => video.pause())
      .catch(() => {})
  }, [attached, mode])

  if (mode === 'still') {
    return <img className={className} style={style} src={posterSrc(clip)} alt="" aria-hidden="true" decoding="async" loading="lazy" />
  }

  return (
    <video
      ref={setRef}
      className={className}
      style={style}
      src={attached ? src : undefined}
      poster={posterSrc(clip)}
      muted
      playsInline
      loop={mode === 'autoplay'}
      autoPlay={mode === 'autoplay'}
      preload={attached ? 'auto' : 'none'}
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    />
  )
}
