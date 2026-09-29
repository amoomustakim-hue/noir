export type ClipKey = 'trailer' | 'reveal' | 'launch' | 'brakes' | 'onboard' | 'rain' | 'helmet' | 'tunnel'

const base = import.meta.env.BASE_URL

// VP9 is less than half the size of H.264 at the same quality, so browsers
// that decode it well get it. Safari (and anything without VP9) gets H.264.
const ext = () => {
  const v = document.createElement('video')
  const safari = /^((?!chrome|chromium|android).)*safari/i.test(navigator.userAgent)
  if (!safari && v.canPlayType('video/webm; codecs="vp9, opus"')) return 'webm'
  return v.canPlayType('video/mp4; codecs="avc1.640028"') ? 'mp4' : 'webm'
}
const phone = () => window.matchMedia('(max-width: 767px)').matches

/** 1080p on desktop, 720p on phones — picked once, when the video is created. */
export const clipSrc = (clip: ClipKey) => `${base}media/${clip}${phone() ? '-m' : ''}.${ext()}`
export const posterSrc = (clip: ClipKey) => `${base}media/${clip}.jpg`
