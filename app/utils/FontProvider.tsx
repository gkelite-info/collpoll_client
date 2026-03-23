"use client";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

type FontContextType = {
  scale: number;
  setScale: (value: number) => void;
};

const FontContext = createContext<FontContextType | undefined>(undefined);

export function FontProvider({ children }: { children: ReactNode }) {
  const MIN = 85;
  const MAX = 115;

  // Initial state safely read from localStorage only in browser
  const [scale, setScale] = useState(() => {
    if (typeof window !== "undefined") {
      return Number(localStorage.getItem("fontScale") ?? 100);
    }
    return 100;
  });

  // Apply scale to <html> whenever it changes
  useEffect(() => {
    document.documentElement.style.fontSize = `${scale}%`;
    localStorage.setItem("fontScale", scale.toString());
  }, [scale]);

  return (
    <FontContext.Provider value={{ scale, setScale }}>
      {children}
    </FontContext.Provider>
  );
}

export function useFont() {
  const context = useContext(FontContext);
  if (!context) throw new Error("useFont must be used within FontProvider");
  return context;
}
