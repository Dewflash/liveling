import { motion, useSpring, useTransform } from 'motion/react'

export function XpBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min(current / max, 1)
  const spring = useSpring(pct, { stiffness: 60, damping: 18 })
  const width = useTransform(spring, (v) => `${v * 100}%`)

  return (
    <div
      className="xp-bar-track panel"
      style={{ height: 14, borderRadius: 7, overflow: 'hidden' }}
    >
      <motion.div
        className="xp-bar-fill"
        style={{
          width,
          height: '100%',
          background:
            'linear-gradient(90deg, var(--color-gold), var(--color-gold-light))',
          borderRadius: 7,
        }}
      />
    </div>
  )
}
