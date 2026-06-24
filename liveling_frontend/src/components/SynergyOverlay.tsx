import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { synergyOverlay } from '../animations/variants'
import { AudioManager } from '../audio/AudioManager'

export function SynergyOverlay({
  show,
  onDone,
}: {
  show: boolean
  onDone: () => void
}) {
  useEffect(() => {
    if (show) {
      AudioManager.playSfx('synergy_activate')
    }
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={synergyOverlay}
          initial="initial"
          animate="animate"
          exit="exit"
          onAnimationComplete={() => {
            window.setTimeout(onDone, 2200)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10,20,10,0.75)',
          }}
        >
          <div style={{ textAlign: 'center', padding: '2rem 3rem' }} className="panel">
            <i
              className="ra ra-infinity"
              style={{
                fontSize: 48,
                color: 'var(--color-gold)',
                display: 'block',
                marginBottom: 12,
              }}
            />
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-gold)',
                fontSize: 28,
                margin: '0 0 8px',
              }}
            >
              Balance Achieved
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                margin: 0,
              }}
            >
              Health - Work - Social: the triad complete.
              <br />
              <strong style={{ color: 'var(--color-gold)' }}>Next reward x 1.5</strong>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
