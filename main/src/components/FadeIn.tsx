'use client'

import { createContext, useContext } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

const FadeInStaggerContext = createContext(false)

const viewport = { once: false, margin: '0px 0px -200px', amount: 0.25 }

interface FadeInProps extends HTMLMotionProps<'div'> {
  animate?: boolean
}

export function FadeIn({ animate, ...props }: FadeInProps) {
  const shouldReduceMotion = useReducedMotion()
  const isInStaggerGroup = useContext(FadeInStaggerContext)

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5 }}
      initial="hidden"
      {...(isInStaggerGroup || animate
        ? { animate: 'visible' }
        : {
            whileInView: 'visible',
            viewport,
          })}
      {...props}
    />
  )
}

interface FadeInStaggerProps extends HTMLMotionProps<'div'> {
  faster?: boolean
  animate?: boolean
}

export function FadeInStagger({ faster = false, animate = true, ...props }: FadeInStaggerProps) {
  return (
    <FadeInStaggerContext.Provider value={true}>
      <motion.div
        initial="hidden"
        animate={animate ? 'visible' : undefined}
        whileInView={animate ? undefined : 'visible'}
        viewport={animate ? undefined : viewport}
        transition={{ staggerChildren: faster ? 0.12 : 0.2 }}
        {...props}
      />
    </FadeInStaggerContext.Provider>
  )
}
