import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Wanderly Travels" },
      { name: "description", content: "Get in touch with Wanderly Travels — we plan custom trips and answer every question within 24 hours." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(80),
  email: z.string().trim().email("Valid email required").max(160),
  message: z.string().trim().min(5, "Tell us a bit more").max(1000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
        <p className="text-sm text-accent font-medium mb-2">Say hello</p>
        <h1 className="font-display text-4xl md:text-6xl font-semibold mb-3">Let's plan something beautiful.</h1>
        <p className="text-muted-foreground">Tell us your dream — we'll come back within 24 hours with a hand-built itinerary.</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const parsed = schema.safeParse(form);
            if (!parsed.success) {
              toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
              return;
            }
            toast.success("Thanks! We'll reply within 24h.");
            setForm({ name: "", email: "", message: "" });
          }}
          className="rounded-3xl bg-card border border-border/50 shadow-soft p-6 md:p-8 space-y-4"
        >
          <Field label="Your name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required /></Field>
          <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required /></Field>
          <Field label="Where are you dreaming of?"><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="input resize-none" required /></Field>
          <Button className="w-full rounded-full bg-primary-gradient text-primary-foreground h-12">Send message</Button>

          <style>{`.input { width:100%; border-radius:1rem; border:1px solid var(--color-border); background:var(--color-background); padding:0.75rem 1rem; font-size:0.875rem; outline:none; transition:box-shadow .2s; }
.input:focus { box-shadow: 0 0 0 3px oklch(0.56 0.12 220 / 0.2); }`}</style>
        </form>

        <aside className="space-y-4">
          {[
            { icon: MapPin, title: "Office", text: "16 Lamachaur, Pokhara" },
            { icon: Phone, title: "Phone", text: "+977 061533288" },
            { icon: Mail, title: "Email", text: "hello@wanderly.travel" },
            { icon: Clock, title: "Hours", text: "Mon–Sat · 9am – 7pm WEST" },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl bg-card border border-border/50 p-5 flex items-start gap-3 shadow-soft">
              <div className="rounded-full bg-secondary p-2"><c.icon className="h-4 w-4 text-primary" /></div>
              <div><p className="text-sm font-semibold">{c.title}</p><p className="text-sm text-muted-foreground">{c.text}</p></div>
            </div>
          ))}
          <div className="aspect-[4/3] rounded-2xl bg-secondary/60 grid place-items-center text-muted-foreground text-sm">Google Maps · Pokhara</div>
        </aside>
      </div>

      <section className="mt-20 max-w-2xl mx-auto">
        <h2 className="font-display text-3xl font-semibold text-center mb-8">Frequently asked</h2>
        <div className="space-y-3">
          {[
            { q: "Can you build a fully custom itinerary?", a: "Always. Every trip we ship is hand-built around the people traveling." },
            { q: "What's your cancellation policy?", a: "Free cancellation up to 30 days before departure on most trips." },
            { q: "Do you handle visas and insurance?", a: "Yes — visa support is included, and travel insurance is available at checkout." },
          ].map((f) => (
            <details key={f.q} className="rounded-2xl border border-border/50 bg-card px-5 py-4 group">
              <summary className="cursor-pointer font-medium list-none flex items-center justify-between">
                {f.q}<span className="text-accent group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-sm font-medium">{label}</span>{children}</label>;
}
