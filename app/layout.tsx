import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
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
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
