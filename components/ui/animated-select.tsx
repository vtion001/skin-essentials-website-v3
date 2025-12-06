import React, { memo } from "react"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface AnimatedSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: Array<{ value: string; label: string }>
  label: string
}

export const AnimatedSelect = memo(({
  value,
  onValueChange,
  placeholder,
  options,
  label
}: AnimatedSelectProps) => {
  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <motion.div
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.1 }}
      >
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:shadow-md focus:shadow-lg">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
    </motion.div>
  )
})

AnimatedSelect.displayName = 'AnimatedSelect'
