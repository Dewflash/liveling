import { useEffect, useState } from 'react'

import { initParticlesEngine } from '@tsparticles/react'
import Particles from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

export function LeafParticles() {
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
      id="leaves"
      options={{
        particles: {
          number: { value: 10 },
          color: { value: ['#8cbf8e', '#6ea87c', '#a6c98d', '#d0d7a1'] },
          opacity: { value: { min: 0.2, max: 0.55 } },
          size: { value: { min: 5, max: 10 } },
          move: {
            enable: true,
            speed: 0.35,
            direction: 'right',
            random: true,
            outModes: { default: 'out' },
            drift: 0.4,
          },
          rotate: {
            value: { min: 0, max: 360 },
            animation: { enable: true, speed: 1.4, sync: false },
          },
          wobble: { enable: true, distance: 22, speed: { min: 1.4, max: 1.8 } },
          shape: { type: 'square' },
        },
        background: { opacity: 0 },
      }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
    />
  )
}
