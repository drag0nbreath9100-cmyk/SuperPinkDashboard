"use client";

import { useTheme } from "@/components/theme-provider";
import { NeuralBackground } from "@/components/ui/neural-background";

export function BackgroundController() {
    const { bgAnimated } = useTheme();

    if (!bgAnimated) return null;

    return (
        <>
            <NeuralBackground />
            {/* Optional Gradient Overlay to blend it with our theme better if needed, 
          but NeuralBackground has its own gradient. 
          We relying on the transparency/blending of the app on top. */}
        </>
    );
}
