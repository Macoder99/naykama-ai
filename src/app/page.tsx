import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Stats } from "@/components/landing/stats";
import { Features } from "@/components/landing/features";
import { LiveDemo } from "@/components/landing/live-demo";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { Security } from "@/components/landing/security";
import { Faq } from "@/components/landing/faq";
import { Contact } from "@/components/landing/contact";
import { CtaBanner, Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <LiveDemo />
        <Testimonials />
        <Pricing />
        <Security />
        <Faq />
        <Contact />
        <CtaBanner />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Naykama AI",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "399", priceCurrency: "ZAR" },
            aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "2300" },
          }),
        }}
      />
    </>
  );
}
