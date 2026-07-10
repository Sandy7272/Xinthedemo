import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EasyVariants · Variant Studio",
  description:
    "Convert product images into production-ready 3D assets. Interactive studio for image-to-3D reconstruction, PBR variants, virtual try-on and export.",
  keywords: [
    "Image to 3D",
    "AI 3D reconstruction",
    "product visualization",
    "Three.js",
    "WebGL",
    "e-commerce 3D",
    "PBR materials",
  ],
  authors: [{ name: "Sandesh Gadakh" }],
  openGraph: {
    title: "EasyVariants · Variant Studio",
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
