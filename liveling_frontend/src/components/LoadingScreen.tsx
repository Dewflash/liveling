import { motion } from 'motion/react'

export function LoadingScreen({ progress }: { progress: number }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-parchment)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 42,
          color: 'var(--color-forest)',
          letterSpacing: '0.08em',
          marginBottom: 8,
        }}
      >
        Liveling
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.3 } }}
        style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          color: 'var(--text-secondary)',
          marginBottom: 32,
        }}
      >
        Your life, your legend.
      </motion.p>
      <div
        style={{
          width: 240,
          height: 8,
          background: 'var(--color-parchment-dark)',
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid var(--panel-border)',
        }}
      >
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'var(--color-gold)',
            borderRadius: 4,
          }}
        />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6, transition: { delay: 0.5 } }}
        style={{
          fontFamily: 'var(--font-stat)',
          fontSize: 12,
          marginTop: 12,
          color: 'var(--text-muted)',
        }}
      >
        Entering the world...
      </motion.p>
    </motion.div>
  )
}
