import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Image-to-3D Studio — AI Product Visualization",
  description:
    "Transform product images into production-ready, web-optimized 3D models with an AI-powered reconstruction workflow. Interactive demo for e-commerce and product visualization.",
  keywords: [
    "Image to 3D",
    "AI 3D reconstruction",
    "product visualization",
    "Three.js",
    "WebGL",
    "e-commerce 3D",
    "PBR materials",
  ],
  authors: [{ name: "Portfolio" }],
  openGraph: {
    title: "Image-to-3D Studio — AI Product Visualization",
    description:
      "An AI-powered workflow for generating interactive, web-ready 3D assets from product photos.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-ink selection:bg-brand-100">
        {children}
      </body>
    </html>
  );
}
