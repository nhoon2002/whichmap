'use client'

import { createContext, useContext } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const FadeInStaggerContext = createContext(false)

const viewport = { once: true, margin: '0px 0px -200px', amount: 0.25 }

export function FadeIn(props) {
  let shouldReduceMotion = useReducedMotion()
  let isInStaggerGroup = useContext(FadeInStaggerContext)

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5 }}
      initial="hidden"
      {...(isInStaggerGroup
        ? { animate: 'visible' }
        : {
            whileInView: 'visible',
            viewport,
          })}
      {...props}
    />
  )
}

export function FadeInStagger({ faster = false, animate = true, ...props }) {
  return (
    <FadeInStaggerContext.Provider value={true}>
      <motion.div
        initial="hidden"
        animate={animate ? "visible" : undefined}
        whileInView={animate ? undefined : "visible"}
        viewport={animate ? undefined : viewport}
        transition={{ staggerChildren: faster ? 0.12 : 0.2 }}
        {...props}
      />
    </FadeInStaggerContext.Provider>
  )
}
