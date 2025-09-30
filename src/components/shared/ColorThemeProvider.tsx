"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ColorVariant } from "@/lib/types";

interface ColorThemeContextType {
  colorVariant: ColorVariant;
  setColorVariant: (variant: ColorVariant) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export const ColorThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [colorVariant, setColorVariantState] = useState<ColorVariant>(() => {
    // Initialize from localStorage or default to 'default'
    if (typeof window !== 'undefined') {
      return (localStorage.getItem("color-variant") as ColorVariant) || "default";
    }
    return "default";
  });

  useEffect(() => {
    // Apply the data-color-variant attribute to the html tag
    document.documentElement.setAttribute("data-color-variant", colorVariant);
    localStorage.setItem("color-variant", colorVariant);
  }, [colorVariant]);

  const setColorVariant = useCallback((variant: ColorVariant) => {
    setColorVariantState(variant);
  }, []);

  return (
    <ColorThemeContext.Provider value={{ colorVariant, setColorVariant }}>
      {children}
    </ColorThemeContext.Provider>
  );
};

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
};