import { createFileRoute } from "@tanstack/react-router";
import { Award, Compass, Heart, Sparkles, Target, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Wanderly — Our Story" },
      { name: "description", content: "Meet the team behind Wanderly Travels — boutique travel designers crafting unforgettable journeys since 2015." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-20">
      <header className="text-center max-w-3xl mx-auto animate-fade-in">
        <p className="text-sm text-accent font-medium mb-2">Our story</p>
        <h1 className="font-display text-4xl md:text-6xl font-semibold mb-4">Travel, the way it was meant to feel.</h1>
        <p className="text-muted-foreground">Wanderly began in 2026 with a stubborn idea — that travel shouldn't feel like a transaction. Today we're a team of 40 across four continents, designing journeys that move people.</p>
      </header>

      <section className="grid md:grid-cols-2 gap-10 items-center">
        <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80" alt="Mountain road" className="rounded-3xl shadow-elegant aspect-[4/3] object-cover" />
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 text-accent mb-2"><Target className="h-4 w-4" /><span className="text-sm font-medium">Mission</span></div>
            <p className="text-foreground/80">Design journeys that turn travelers into storytellers — and the world into a smaller, kinder place.</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-accent mb-2"><Compass className="h-4 w-4" /><span className="text-sm font-medium">Vision</span></div>
            <p className="text-foreground/80">A world where every trip leaves the place better than you found it, and the traveler changed.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-center mb-10">Our team</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { name: "Akisa Poudel", role: "Founder & CEO", img: "/images/akisa.jpg" },
            { name: "Aishwarya Dahal", role: "Head of Experiences", img: "/images/aishwarya.jpg" },
            { name: "Swastika Bhattarai", role: "Adventure Lead", img: "/images/swastika.jpg" },
          ].map((m) => (
            <div key={m.name} className="rounded-3xl bg-card border border-border/50 p-5 text-center shadow-soft">
              <img src={m.img} alt={m.name} className="h-36 w-36 rounded-full mx-auto mb-3 object-cover object-center" />
              <p className="font-display text-lg font-semibold">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-center mb-10">Milestones</h2>
        <div className="relative max-w-2xl mx-auto pl-8 border-l-2 border-dashed border-border space-y-8">
          {[
            { year: "2026", text: "Wanderly is founded out at Lamachaur, Pokhara with one itinerary." },
          ].map((m) => (
            <div key={m.year} className="relative">
              <div className="absolute -left-10 top-1 h-4 w-4 rounded-full bg-accent-gradient shadow-glow" />
              <p className="font-display text-lg text-primary font-semibold">{m.year}</p>
              <p className="text-sm text-foreground/80">{m.text}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
