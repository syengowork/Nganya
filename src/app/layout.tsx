import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner"; // Notification System
import "./globals.css";

// 1. Load the Standard Font (UI Text)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

// 2. Load the "Street" Font (Headers & Branding)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-street",
  display: "swap",
});

// 3. Robust SEO Metadata
export const metadata: Metadata = {
  title: {
    default: "NganyaOps | Intelligent Transport OS",
    template: "%s | NganyaOps",
  },
  description: "The complete operating system for Kenya's vibrant matatu culture. Manage fleets, bookings, and analytics in real-time.",
  keywords: ["matatu", "transport", "kenya", "fleet management", "sacco", "nganya"],
  authors: [{ name: "NganyaOps Team" }],
  creator: "NganyaOps",
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://nganyaops.com",
    title: "NganyaOps",
    description: "The intelligent operating system for Kenya's transport culture.",
    siteName: "NganyaOps",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

// 4. Viewport Settings (Prevent zooming issues on mobile inputs)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is REQUIRED for next-themes
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-background text-foreground`}
      >
        {/* Wrap the app in the ThemeProvider */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          
          {/* Global Notification Toaster */}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}