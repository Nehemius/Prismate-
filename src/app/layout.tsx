import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "PRISMATE",
  description: "Playful · Powerful · Purposeful",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Load 3Dmol.js from official CDN before interactive hydration */}
        <Script
          src="https://3Dmol.org/build/3Dmol-min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased bg-black text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
