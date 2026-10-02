import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pt-32 pb-20 sm:px-6">
        <h1 className="font-display text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>
        <div className="mt-10 space-y-6 leading-relaxed text-foreground/85 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
