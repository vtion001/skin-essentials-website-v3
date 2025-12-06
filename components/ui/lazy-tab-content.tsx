import React, { memo } from "react"
import { motion } from "framer-motion"

interface LazyTabContentProps {
  children: React.ReactNode
  isActive: boolean
}

export const LazyTabContent = memo(({ 
  children, 
  isActive 
}: LazyTabContentProps) => {
  if (!isActive) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
})

LazyTabContent.displayName = 'LazyTabContent'
