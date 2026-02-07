"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string;
  forceWhite?: boolean; // For transparent headers
}

export function ThemeToggle({ className, forceWhite = false }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch by waiting for mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    // Instantly switch to the opposite of the current active theme
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative rounded-full transition-all duration-300",
        forceWhite 
          ? "text-white hover:bg-white/20 hover:text-white ring-0 border-0" 
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        className
      )}
      aria-label="Toggle Theme"
    >
      {/* Sun: Visible in Light, Hidden in Dark */}
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      
      {/* Moon: Hidden in Light, Visible in Dark */}
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}