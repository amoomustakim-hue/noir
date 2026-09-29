import { useCallback, useState, type ReactNode } from 'react'
import { Chapter } from './components/Chapter'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { BrakesHud, LaunchHud, OnboardHud, PulseHud, RainHud, SpecsHud } from './components/Huds'
import { Nav } from './components/Nav'
import { Numbers } from './components/Numbers'
import { Preloader } from './components/Preloader'
import { CHAPTERS, type Hud } from './config/film'
import { useScrollLock } from './hooks/useLenis'

const HUDS: Record<Hud, ReactNode> = {
  specs: <SpecsHud />,
  launch: <LaunchHud />,
  brakes: <BrakesHud />,
  onboard: <OnboardHud />,
  rain: <RainHud />,
  pulse: <PulseHud />,
  none: null,
}

export default function App() {
  const [ready, setReady] = useState(false)
  const onDone = useCallback(() => setReady(true), [])
  useScrollLock(!ready)

  const chapter = (i: number) => (
    <Chapter key={CHAPTERS[i].id} data={CHAPTERS[i]} index={i} total={CHAPTERS.length}>
      {HUDS[CHAPTERS[i].hud]}
    </Chapter>
  )
  const last = CHAPTERS.length - 1

  return (
    <>
      <a className="skip meta" href="#reveal">
        Skip to the film
      </a>
      <Preloader onDone={onDone} />
      <Nav />
      <main>
        <Hero ready={ready} />
        {CHAPTERS.slice(0, last).map((_, i) => chapter(i))}
        <Numbers />
        {chapter(last)}
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
