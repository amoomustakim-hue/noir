import type { ClipKey } from './media'

export type Hud = 'specs' | 'launch' | 'brakes' | 'onboard' | 'rain' | 'pulse' | 'none'

export type ChapterData = {
  id: ClipKey
  label: string
  title: [string, string]
  lede?: string
  hud: Hud
  /** Scroll length of the pinned chapter, in % of the viewport height (desktop). */
  length: number
  /** On phones: fill the screen, or keep the whole 16:9 frame in a band. */
  phone: 'cover' | 'band'
  /** object-position when covering on phones. */
  focus?: string
  finale?: boolean
}

export const CAR = { name: 'NOIR', model: 'N/01' }

export const CHAPTERS: ChapterData[] = [
  {
    id: 'reveal',
    label: 'Reveal',
    title: ['Out of', 'the dark.'],
    lede: 'One strip of light, one pass of the camera. Carbon, a red pinstripe, and nothing the car doesn’t need.',
    hud: 'specs',
    length: 360,
    phone: 'band',
  },
  {
    id: 'launch',
    label: 'Launch',
    title: ['Lights', 'out.'],
    lede: 'Five reds, then nothing. The rears bite, the floor throws sparks, and the grid is already behind you.',
    hud: 'launch',
    length: 380,
    phone: 'band',
  },
  {
    id: 'brakes',
    label: 'Heat',
    title: ['Heat is', 'a tool.'],
    lede: 'From 330 to 80 km/h in under four seconds. The carbon discs glow past a thousand degrees and ask for more.',
    hud: 'brakes',
    length: 320,
    phone: 'cover',
    focus: '50% 50%',
  },
  {
    id: 'onboard',
    label: 'Onboard',
    title: ['Eye', 'level.'],
    lede: 'Halo overhead, floodlights in the corner of your eye, the wheel counting gears. This is the seat.',
    hud: 'onboard',
    length: 380,
    phone: 'cover',
    focus: '50% 60%',
  },
  {
    id: 'rain',
    label: 'Rain',
    title: ['Any', 'weather.'],
    lede: 'Full wets, full commitment. At speed the car pulls a wall of water behind it — and disappears into it.',
    hud: 'rain',
    length: 240,
    phone: 'cover',
    focus: '55% 50%',
  },
  {
    id: 'helmet',
    label: 'Driver',
    title: ['The one', 'inside.'],
    lede: 'Matte shell, red visor line, the same pinstripe as the car. You never see the face. Only the decision.',
    hud: 'pulse',
    length: 300,
    phone: 'cover',
    focus: '42% 50%',
  },
  {
    id: 'tunnel',
    label: 'Night',
    title: ['Into', 'the night.'],
    hud: 'none',
    length: 260,
    phone: 'cover',
    focus: '50% 50%',
    finale: true,
  },
]

export const REVEAL_SPECS: [string, string][] = [
  ['Chassis', 'Carbon monocoque'],
  ['Mass', '798 kg'],
  ['Wheelbase', '3,600 mm'],
  ['Livery', 'Matte black / signal red'],
]

type Figure = { label: string; value: number; unit: string; suffix?: string; decimals?: number }

export const NUMBERS: Figure[] = [
  { label: 'Power', value: 1000, unit: 'hp', suffix: '+' },
  { label: 'Mass', value: 798, unit: 'kg' },
  { label: '0–100 km/h', value: 2.6, unit: 's', decimals: 1 },
  { label: 'Top speed', value: 350, unit: 'km/h' },
  { label: 'Brake temperature', value: 1000, unit: '°C' },
  { label: 'Peak cornering', value: 6, unit: 'g' },
]

export const CREDITS = {
  author: 'Mustakheem Amoo',
  alias: 'Olacodes',
  email: 'amoomustakim@gmail.com',
}
