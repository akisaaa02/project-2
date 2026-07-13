import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Check, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { packagesQuery } from "@/lib/queries";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Travel Packages — Wanderly Travels" },
      { name: "description", content: "Curated travel packages with everything included — flights, hotels, tours and unforgettable experiences." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(packagesQuery()),
  component: PackagesPage,
});

function PackagesPage() {
  const { data } = useSuspenseQuery(packagesQuery());
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
        <p className="text-sm text-accent font-medium mb-2">Curated packages</p>
        <h1 className="font-display text-4xl md:text-6xl font-semibold mb-3">Everything included.</h1>
        <p className="text-muted-foreground">Hand-picked itineraries — flights, hotels, guides and the little surprises.</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((p) => {
          const facilities = (p.facilities as string[]) || [];
          const discounted = p.discount_percent ? Math.round(Number(p.price) * (1 - p.discount_percent / 100)) : Number(p.price);
          return (
            <article key={p.id} className="group rounded-3xl bg-card border border-border/50 shadow-soft hover:shadow-elegant transition-all overflow-hidden hover:-translate-y-1">
              <div className="relative aspect-[5/4] overflow-hidden">
                <img src={p.image_url} alt={p.title} loading="lazy" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                {p.discount_percent > 0 && (
                  <div className="absolute top-3 left-3 rounded-full bg-accent-gradient px-3 py-1 text-xs font-semibold text-accent-foreground shadow-soft">
                    -{p.discount_percent}% OFF
                  </div>
                )}
                <div className="absolute top-3 right-3 glass rounded-full px-3 py-1 text-xs flex items-center gap-1">
                  <Star className="h-3 w-3 fill-accent text-accent" /> {p.rating}
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">{p.country}</p>
                  <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {p.duration}</p>
                <ul className="space-y-1 text-sm">
                  {facilities.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-foreground/80">
                      <Check className="h-3.5 w-3.5 text-accent" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-end justify-between pt-2 border-t border-border/50">
                  <div>
                    {p.discount_percent > 0 && <p className="text-xs text-muted-foreground line-through">${Number(p.price).toLocaleString()}</p>}
                    <p className="font-display text-2xl font-semibold text-primary">${discounted.toLocaleString()}</p>
                  </div>
                  <Link to="/destinations">
                    <Button size="sm" className="rounded-full bg-accent-gradient text-accent-foreground">Explore</Button>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
