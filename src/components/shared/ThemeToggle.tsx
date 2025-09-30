"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  onHeaderBg?: boolean;
  iconTextColorClass?: string; // New prop for custom icon text color
}

export function ThemeToggle({ onHeaderBg, iconTextColorClass }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const buttonHoverClasses = "hover:scale-110 hover:shadow-lg transition-all duration-200";

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        onHeaderBg && "bg-transparent border-current hover:bg-foreground/10",
        iconTextColorClass || "text-foreground", // Apply here
        buttonHoverClasses
      )}
      onClick={toggleTheme}
    >
      {theme === "dark" ? (
        <Sun className={cn("h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all", iconTextColorClass || "text-foreground")} />
      ) : (
        <Moon className={cn("h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all", iconTextColorClass || "text-foreground")} />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}