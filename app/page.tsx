import { About } from "@/components/home/about";
import { FAQ } from "@/components/home/faq";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { Stats } from "@/components/home/stats";
import { Testimonials } from "@/components/home/testimonials";
import { WhyUs } from "@/components/home/why-us";
import { SiteNavbar } from "@/components/site-navbar";
import Footer from "@/components/ui/footer-4";

export default function Home() {
  return (
    <div className="relative isolate flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-md focus:bg-surface-raised focus:px-4 focus:text-accent"
      >
        Skip to content
      </a>
      <SiteNavbar />
      <main id="main-content" tabIndex={-1} className="site-container flex flex-1 flex-col">
        <Hero />
        <About />
        <WhyUs />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
