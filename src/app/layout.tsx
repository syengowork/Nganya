import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

// 1. Load the Standard Font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans", // Matches your CSS
});

// 2. Load the "Street" Font (Matatu Vibe)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-street", // Matches your CSS
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}