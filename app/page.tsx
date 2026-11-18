import { About } from "@/components/home/about";
import { Hero } from "@/components/home/hero";
import { WhyUs } from "@/components/home/why-us";
import { SiteNavbar } from "@/components/site-navbar";

export default function Home() {
  return (
    <div className="relative isolate flex min-h-svh flex-col">
      <SiteNavbar />
      <main className="flex flex-1 flex-col">
        <Hero />
        <About />
        <WhyUs />
      </main>
    </div>
  );
}
