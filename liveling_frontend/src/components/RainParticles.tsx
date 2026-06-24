import { useEffect, useState } from 'react'

import { initParticlesEngine } from '@tsparticles/react'
import Particles from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

export function RainParticles() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setReady(true)
    })
  }, [])

  if (!ready) {
    return null
  }

  return (
    <Particles
      id="rain"
      options={{
        particles: {
          number: { value: 80 },
          color: { value: '#a0c8e0' },
          opacity: { value: 0.4 },
          size: { value: 1 },
          move: {
            enable: true,
            speed: 8,
            direction: 'bottom-right',
            straight: true,
            outModes: { default: 'out' },
          },
          shape: { type: 'line' },
          rotate: { value: 15, animation: { enable: false }, direction: 'clockwise' },
          life: { duration: { value: 2 } },
        },
        interactivity: { events: {} },
        background: { opacity: 0 },
      }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
    />
  )
}
