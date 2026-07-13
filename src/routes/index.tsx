import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Award, Compass, Globe2, Heart, Plane, Search, Shield, Sparkles, Star, Users } from "lucide-react";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { DestinationCard } from "@/components/DestinationCard";
import { featuredDestinationsQuery } from "@/lib/queries";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wanderly Travels — Crafted Journeys to Every Continent" },
      { name: "description", content: "Discover curated travel experiences to 200+ destinations worldwide. Book unforgettable adventures with Wanderly." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(featuredDestinationsQuery());
  },
  component: Home,
});

function Home() {
  const [search, setSearch] = useState("");
  return (
    <>
      <Hero search={search} setSearch={setSearch} />
      <Stats />
      <Suspense fallback={<FeaturedSkeleton />}>
        <Featured />
      </Suspense>
      <WhyUs />
      <Testimonials />
      <Newsletter />
    </>
  );
}

function Hero({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  return (
    <section className="relative overflow-hidden bg-hero-gradient">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 -left-20 w-80 h-80 rounded-full bg-secondary blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent/30 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>
      <div className="container relative mx-auto px-4 py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-7 animate-fade-in">
  
          <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight">
            Wander further,<br />
            <span className="italic text-primary">feel everything.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Hand-crafted journeys to 200+ destinations across every continent — from Kyoto's lanterns to Patagonian peaks.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/destinations?q=${encodeURIComponent(search)}`;
            }}
            className="flex items-center gap-2 rounded-full bg-card p-2 shadow-elegant max-w-xl"
          >
            <Search className="h-5 w-5 text-muted-foreground ml-3" />
            <input
              type="text"
              placeholder="Try 'Iceland' or 'beach'"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm py-2"
            />
            <Button type="submit" size="sm" className="rounded-full bg-primary-gradient text-primary-foreground hover:opacity-90 gap-1">
              Search <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/destinations"><Button variant="ghost" size="sm" className="rounded-full gap-2"><Compass className="h-4 w-4" /> All destinations</Button></Link>
            <Link to="/packages"><Button variant="ghost" size="sm" className="rounded-full gap-2"><Award className="h-4 w-4" /> Packages</Button></Link>
          </div>
        </div>

        <div className="relative hidden lg:block animate-scale-in">
          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-elegant">
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=80"
              alt="A traveler watching the sunrise"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { icon: Users, value: "50K+", label: "Happy travelers" },
    { icon: Globe2, value: "70+", label: "Countries covered" },
    { icon: Plane, value: "1,200+", label: "Tours completed" },
    { icon: Award, value: "15", label: "Travel awards" },
  ];
  return (
    <section className="container mx-auto px-4 -mt-10 relative z-10">
      <div className="rounded-3xl bg-card shadow-elegant grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/50 overflow-hidden">
        {stats.map((s) => (
          <div key={s.label} className="p-6 text-center space-y-1">
            <s.icon className="h-5 w-5 mx-auto text-accent" />
            <p className="font-display text-3xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedSkeleton() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-3xl bg-muted/50 h-96 animate-pulse" />
        ))}
      </div>
    </section>
  );
}

function Featured() {
  const { data } = useSuspenseQuery(featuredDestinationsQuery());
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <div>
          <p className="text-sm text-accent font-medium mb-2">Featured destinations</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold">Loved by our travelers</h2>
        </div>
        <Link to="/destinations">
          <Button variant="outline" className="rounded-full">View all <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((d) => <DestinationCard key={d.id} d={d} />)}
      </div>
    </section>
  );
}

function WhyUs() {
  const items = [
    { icon: Shield, title: "Safety first", text: "Every trip is fully insured and 24/7 supported by local experts." },
    { icon: Heart, title: "Hand-crafted", text: "No cookie-cutter tours — every itinerary is built by people who've been there." },
    { icon: Sparkles, title: "Magic moments", text: "Hidden viewpoints, family-run kitchens, sunsets you'll never forget." },
    { icon: Award, title: "Award-winning", text: "Named Best Boutique Agency three years running by Condé Nast." },
  ];
  return (
    <section className="bg-muted/40 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-sm text-accent font-medium mb-2">Why Wanderly</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold">Travel that feels personal</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <div key={it.title} className="rounded-3xl bg-card p-6 shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1">
              <div className="rounded-2xl bg-secondary w-12 h-12 grid place-items-center mb-4">
                <it.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{it.title}</h3>
              <p className="text-sm text-muted-foreground">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Aaisa Karki", trip: "Bali Wellness Retreat", text: "Every detail was thought through. I cried at the sunrise hike. Worth every penny.", img: "https://i.pravatar.cc/100?img=47" },
    { name: "Ram Baniya", trip: "Iceland Aurora", text: "Our guide knew exactly when to chase the lights — saw the strongest aurora in 5 years.", img: "https://i.pravatar.cc/100?img=12" },
    { name: "Sofia & Aaahan", trip: "Honeymoon Maldives", text: "An impossibly romantic trip. They surprised us with a private dinner on a sandbank.", img: "https://i.pravatar.cc/100?img=32" },
  ];
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-sm text-accent font-medium mb-2">Travelers' stories</p>
        <h2 className="font-display text-4xl md:text-5xl font-semibold">Postcards of joy</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((t) => (
          <figure key={t.name} className="rounded-3xl bg-card border border-border/50 p-6 shadow-soft">
            <div className="flex gap-1 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}</div>
            <blockquote className="text-sm text-foreground/80 mb-5">"{t.text}"</blockquote>
            <figcaption className="flex items-center gap-3">
              <img src={t.img} alt={t.name} className="h-10 w-10 rounded-full" />
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.trip}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="container mx-auto px-4 pb-20">
      <div className="rounded-[2.5rem] bg-primary-gradient p-10 md:p-16 text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-accent/40 blur-3xl" />
        <div className="relative max-w-2xl">
          <h3 className="font-display text-3xl md:text-5xl font-semibold mb-3">Postcards, monthly.</h3>
          <p className="opacity-90 mb-6">New itineraries, traveler tips and members-only deals — one beautiful email a month.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem("email") as HTMLInputElement);
              if (input.value) { input.value = ""; toast.success("You're on the list. ✈️"); }
            }}
            className="flex gap-2 max-w-lg flex-wrap sm:flex-nowrap"
          >
            <input name="email" type="email" required placeholder="you@email.com" className="flex-1 min-w-[200px] rounded-full bg-white/15 backdrop-blur border border-white/30 px-5 py-3 text-sm placeholder:text-white/60 outline-none" />
            <button className="rounded-full bg-accent-gradient px-6 py-3 text-sm font-medium hover:opacity-90">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  );
}
