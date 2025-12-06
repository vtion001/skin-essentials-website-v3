import React, { memo } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface AnimatedInputProps {
  id: string
  label: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  placeholder?: string
  className?: string
}

export const AnimatedInput = memo(({ 
  id, 
  label, 
  value, 
  onChange, 
  type = "text", 
  required = false,
  placeholder = "",
  className = ""
}: AnimatedInputProps) => {
  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <motion.div
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.1 }}
      >
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={cn(
            "transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent",
            "hover:shadow-md focus:shadow-lg",
            className
          )}
        />
      </motion.div>
    </motion.div>
  )
})

AnimatedInput.displayName = 'AnimatedInput'
