import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { pageVariants } from '../animations/variants'

interface PageWrapperProps {
  children: ReactNode
  pageKey: string
}

export function PageWrapper({ children, pageKey }: PageWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
