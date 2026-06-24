import { motion } from 'motion/react'

import { floatUpVariants } from '../animations/variants'

type RewardType = 'xp' | 'vitality' | 'essence' | 'credits' | 'custom'

export function FloatingReward({
  amount,
  type,
  onDone,
}: {
  amount: number
  type: RewardType
  onDone: () => void
}) {
  const colorMap: Record<RewardType, string> = {
    xp: 'var(--color-gold)',
    vitality: 'var(--color-vitality)',
    essence: 'var(--color-essence)',
    credits: 'var(--color-credits)',
    custom: 'var(--color-custom)',
  }

  const iconMap: Record<RewardType, string> = {
    xp: 'ra-star',
    vitality: 'ra-heart',
    essence: 'ra-crystal-ball',
    credits: 'ra-coins',
    custom: 'ra-gem',
  }

  return (
    <motion.div
      variants={floatUpVariants}
      initial="initial"
      animate="animate"
      onAnimationComplete={onDone}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 100,
        color: colorMap[type],
        fontFamily: 'var(--font-stat)',
        fontWeight: 600,
        fontSize: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <i className={`ra ${iconMap[type]}`} style={{ fontSize: 14 }} />
      +{amount}
    </motion.div>
  )
}
