import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import "lenis/dist/lenis.css";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], display: "swap" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Vanguard AV",
  icons: { icon: "/big-logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={jetbrainsMono.variable}
    >
      <body className={outfit.className}>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
