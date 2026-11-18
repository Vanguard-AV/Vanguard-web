import { ReactLenis } from "lenis/react";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Vanguard AV",
  icons: { icon: "/big-logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <ReactLenis root options={{ autoRaf: true, lerp: 0.075, anchors: { duration: 1.1 } }} />
        {children}
      </body>
    </html>
  );
}
