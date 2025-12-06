import React, { memo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedButtonProps {
  onClick?: () => void
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  loading?: boolean
  disabled?: boolean
  className?: string
  type?: "button" | "submit" | "reset"
}

export const EnhancedButton = memo(({
  onClick,
  children,
  variant = "default",
  size = "default",
  loading = false,
  disabled = false,
  className = "",
  type = "button"
}: EnhancedButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      transition={{ duration: 0.1 }}
    >
      <Button
        type={type}
        onClick={onClick}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        className={cn(
          "transition-all duration-200",
          "focus:ring-2 focus:ring-offset-2 focus:ring-purple-500",
          className
        )}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-4 h-4" />
          </motion.div>
        ) : children}
      </Button>
    </motion.div>
  )
})

EnhancedButton.displayName = 'EnhancedButton'
