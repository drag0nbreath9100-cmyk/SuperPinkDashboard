import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { ThemeProvider } from "@/components/theme-provider";
import { BackgroundController } from "@/components/background-controller";
import { Toaster } from "sonner";
import { NotificationListener } from "@/components/NotificationListener";
import { QueryProvider } from "@/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OmarFit | Intelligence Engine",
  description: "Advanced Coaching Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider>
            <BackgroundController />
            <div className="noise-overlay fixed inset-0 pointer-events-none z-0 opacity-30 bg-repeat [background-image:var(--bg-noise)] will-change-transform translate-z-0"></div>
            {/* Ambient Blur matching snippet */}
            <div style={{
              position: 'fixed',
              top: '-10%',
              left: '30%',
              width: '800px',
              height: '800px',
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
              filter: 'blur(80px)',
              pointerEvents: 'none',
              zIndex: 1,
              willChange: 'transform',
              transform: 'translateZ(0)'
            }} />

            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <Toaster position="bottom-center" theme="dark" />
            <NotificationListener />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

