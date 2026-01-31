"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeColor = "blue" | "violet" | "emerald" | "rose" | "amber" | "cyan";
type ThemeRadius = "0" | "0.5rem" | "1rem" | "1.5rem" | "2rem";

interface ThemeContextType {
    color: ThemeColor;
    setColor: (color: ThemeColor) => void;
    radius: ThemeRadius;
    setRadius: (radius: ThemeRadius) => void;
    glassEnabled: boolean;
    setGlassEnabled: (enabled: boolean) => void;
    bgAnimated: boolean;
    setBgAnimated: (enabled: boolean) => void;
    bgStyle: "dynamic" | "static";
    setBgStyle: (style: "dynamic" | "static") => void;
    resetToDefaults: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define HSL values for our themes
const themes: Record<ThemeColor, { primary: string; ring: string; gradientStop: string }> = {
    blue: { primary: "217 91% 60%", ring: "212.7 26.8% 83.9%", gradientStop: "270 50% 40%" }, // #3b82f6 -> Purple
    violet: { primary: "262 83% 58%", ring: "262 83% 83%", gradientStop: "320 60% 50%" }, // #8b5cf6 -> Pink
    emerald: { primary: "142 71% 45%", ring: "142 71% 75%", gradientStop: "180 50% 40%" }, // #10b981 -> Teal
    rose: { primary: "343 100% 50%", ring: "343 100% 80%", gradientStop: "280 50% 40%" }, // #f43f5e -> Purple
    amber: { primary: "38 92% 50%", ring: "38 92% 80%", gradientStop: "10 80% 50%" }, // #f59e0b -> Red
    cyan: { primary: "190 90% 50%", ring: "190 90% 80%", gradientStop: "210 80% 50%" } // #06b6d4 -> Blue
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Initialize with default or saved values
    // We use a small hack to avoid hydration mismatch by waiting for mount
    const [color, setColor] = useState<ThemeColor>("blue");
    const [radius, setRadius] = useState<ThemeRadius>("1rem"); // Default from globals.css
    const [glassEnabled, setGlassEnabled] = useState(true);
    const [bgAnimated, setBgAnimated] = useState(false);
    const [bgStyle, setBgStyle] = useState<"dynamic" | "static">("dynamic");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedColor = localStorage.getItem("theme-color") as ThemeColor;
        const savedRadius = localStorage.getItem("theme-radius") as ThemeRadius;
        const savedGlass = localStorage.getItem("theme-glass");
        const savedBgAnimated = localStorage.getItem("theme-bg-animated");
        const savedBgStyle = localStorage.getItem("theme-bg-style");

        // eslint-disable-next-line react-hooks/exhaustive-deps
        if (savedColor) setColor(savedColor);
        if (savedRadius) setRadius(savedRadius);
        if (savedGlass) setGlassEnabled(savedGlass === "true");
        if (savedBgAnimated) setBgAnimated(savedBgAnimated === "true");
        if (savedBgStyle) setBgStyle(savedBgStyle as "dynamic" | "static");

        setMounted(true);
    }, []);

    const resetToDefaults = () => {
        setColor("blue");
        setRadius("1rem");
        setGlassEnabled(true);
        setBgAnimated(false);
        setBgStyle("static");
    };

    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        const theme = themes[color];

        // Set CSS Variables
        root.style.setProperty("--primary", theme.primary);
        root.style.setProperty("--ring", theme.ring);
        root.style.setProperty("--gradient-stop", theme.gradientStop);
        root.style.setProperty("--radius", radius);

        // Dynamic vs Static Background
        if (bgStyle === "static") {
            // Original Classic Look
            root.style.setProperty("--bg-start", "#1e1b4b"); // Dark Indigo
            root.style.setProperty("--bg-end", "rgba(59, 130, 246, 0.15)"); // Blue tint
        } else {
            // Dynamic Theme Look
            root.style.setProperty("--bg-start", `hsl(${theme.primary} / 0.15)`);
            root.style.setProperty("--bg-end", `hsl(${theme.primary} / 0.1)`);
        }

        // Handle Glass Effect Toggle
        if (glassEnabled) {
            document.body.classList.remove("glass-disabled");
        } else {
            document.body.classList.add("glass-disabled");
        }

        // Persist
        localStorage.setItem("theme-color", color);
        localStorage.setItem("theme-radius", radius);
        localStorage.setItem("theme-glass", String(glassEnabled));
        localStorage.setItem("theme-bg-animated", String(bgAnimated));
        localStorage.setItem("theme-bg-style", bgStyle);

    }, [color, radius, glassEnabled, bgAnimated, bgStyle, mounted]);

    return (
        <ThemeContext.Provider value={{ color, setColor, radius, setRadius, glassEnabled, setGlassEnabled, bgAnimated, setBgAnimated, bgStyle, setBgStyle, resetToDefaults }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};
