import type { Variants } from 'motion/react'

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

export const cardPopVariants: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 24 },
  },
  exit: { opacity: 0, scale: 0.85, y: -4, transition: { duration: 0.18 } },
}

export const rewardPopVariants: Variants = {
  initial: { opacity: 0, scale: 0.5, y: 0 },
  animate: {
    opacity: 1,
    scale: [0.5, 1.25, 1],
    y: 0,
    transition: { duration: 0.5, times: [0, 0.5, 1], ease: 'easeOut' },
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
}

export const floatUpVariants: Variants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 0, y: -48, transition: { duration: 1.2, ease: 'easeOut' } },
}

export const shakeVariants: Variants = {
  shake: { x: [0, -6, 6, -6, 6, -3, 3, 0], transition: { duration: 0.4 } },
}

export const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.07 } },
}

export const staggerChild: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 22 },
  },
}

export const xpBarVariants = {
  transition: { duration: 0.9, ease: [0.23, 1, 0.32, 1] },
}

export const missionCompleteExit: Variants = {
  exit: {
    opacity: 0,
    scale: 0.92,
    height: 0,
    marginBottom: 0,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
}

export const synergyOverlay: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 16 },
  },
  exit: { opacity: 0, scale: 1.1, transition: { duration: 0.4 } },
}
