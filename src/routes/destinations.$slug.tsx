import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Calendar, Camera, Clock, Compass, DollarSign, Heart, Hotel, MapPin, Plane, Star, Sun, Utensils } from "lucide-react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { destinationBySlugQuery, destinationsQuery, reviewsForDestinationQuery } from "@/lib/queries";

export const Route = createFileRoute("/destinations/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Wanderly` },
      { name: "description", content: "Explore this destination with Wanderly Travels — overview, culture, food, hotels and booking." },
    ],
  }),
  loader: async ({ context, params }) => {
    const dest = await context.queryClient.ensureQueryData(destinationBySlugQuery(params.slug));
    if (!dest) throw notFound();
  },
  component: ExplorePage,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-3xl">Destination not found</h1>
      <Link to="/destinations" className="mt-4 inline-block text-primary underline">Browse all destinations</Link>
    </div>
  ),
  errorComponent: () => <div className="container mx-auto px-4 py-20 text-center">Couldn't load this destination.</div>,
});

function ExplorePage() {
  const { slug } = Route.useParams();
  const { data: d } = useSuspenseQuery(destinationBySlugQuery(slug));
  if (!d) return null;

  const attractions = (d.attractions as string[]) || [];
  const hotels = (d.hotel_recommendations as string[]) || [];
  const tips = (d.travel_tips as string[]) || [];
  const services = (d.included_services as string[]) || [];
  const nearby = (d.nearby_attractions as string[]) || [];

  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[450px] overflow-hidden">
        <img src={d.image_url} alt={d.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="container mx-auto px-4 h-full flex items-end pb-12 relative">
          <div className="space-y-4 max-w-2xl animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
              <MapPin className="h-3 w-3" /> {d.city}, {d.country}
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-semibold text-white drop-shadow-lg">{d.title}</h1>
            <div className="flex flex-wrap gap-4 text-white">
              <Stat icon={<Star className="h-4 w-4 fill-accent text-accent" />} label={`${d.rating} rating`} />
              <Stat icon={<Clock className="h-4 w-4" />} label={d.duration} />
              <Stat icon={<DollarSign className="h-4 w-4" />} label={`From $${d.price.toLocaleString()}`} />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 grid lg:grid-cols-[1fr_360px] gap-10">
        <article className="space-y-10">
          <Section title="Overview" icon={Compass}>
            <p className="text-foreground/80 leading-relaxed">{d.long_description || d.short_description}</p>
          </Section>

          {d.history && <Section title="History"><p className="text-foreground/80">{d.history}</p></Section>}
          {d.culture && <Section title="Culture" icon={Heart}><p className="text-foreground/80">{d.culture}</p></Section>}
          {d.food && <Section title="Food" icon={Utensils}><p className="text-foreground/80">{d.food}</p></Section>}

          {attractions.length > 0 && (
            <Section title="Popular attractions" icon={Camera}>
              <ul className="grid sm:grid-cols-2 gap-2">
                {attractions.map((a) => (
                  <li key={a} className="rounded-2xl bg-muted px-4 py-3 text-sm flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {a}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            {d.weather && <InfoCard icon={Sun} title="Weather">{d.weather}</InfoCard>}
            {d.best_season && <InfoCard icon={Calendar} title="Best season">{d.best_season}</InfoCard>}
            {d.transportation && <InfoCard icon={Plane} title="Transportation">{d.transportation}</InfoCard>}
            {d.budget_estimate && <InfoCard icon={DollarSign} title="Budget">{d.budget_estimate}</InfoCard>}
          </div>

          {hotels.length > 0 && (
            <Section title="Hotel recommendations" icon={Hotel}>
              <ul className="space-y-2">
                {hotels.map((h) => <li key={h} className="rounded-2xl bg-muted px-4 py-3 text-sm">{h}</li>)}
              </ul>
            </Section>
          )}

          {services.length > 0 && (
            <Section title="What's included">
              <ul className="grid sm:grid-cols-2 gap-2">
                {services.map((s) => (
                  <li key={s} className="text-sm flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent" /> {s}</li>
                ))}
              </ul>
            </Section>
          )}

          {tips.length > 0 && (
            <Section title="Travel tips">
              <ul className="space-y-2">
                {tips.map((t) => <li key={t} className="rounded-2xl border border-border/60 px-4 py-3 text-sm">💡 {t}</li>)}
              </ul>
            </Section>
          )}

          <Section title="Interactive map">
            <div className="aspect-[16/9] rounded-3xl bg-secondary/60 grid place-items-center text-muted-foreground">
              Interactive map of {d.city}
            </div>
          </Section>

          <Suspense fallback={null}>
            <Reviews destinationId={d.id} />
          </Suspense>

          {nearby.length > 0 && (
            <Section title="Nearby attractions">
              <div className="flex flex-wrap gap-2">
                {nearby.map((n) => <span key={n} className="rounded-full bg-secondary px-4 py-2 text-sm">{n}</span>)}
              </div>
            </Section>
          )}

          <Suspense fallback={null}>
            <Similar country={d.country} excludeId={d.id} />
          </Suspense>
        </article>

        <aside className="lg:sticky lg:top-24 self-start">
          <div className="rounded-3xl bg-card border border-border/50 shadow-elegant p-6 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">starting from</p>
              <p className="font-display text-4xl font-semibold text-primary">${d.price.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">per person · {d.duration}</p>
            </div>
            <Link to="/booking/$slug" params={{ slug: d.slug }}>
              <Button className="w-full rounded-full bg-accent-gradient text-accent-foreground hover:opacity-90 h-12">Book Now</Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center">Free cancellation up to 30 days before departure</p>
          </div>
        </aside>
      </div>
    </>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-sm">
      {icon} {label}
    </span>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl md:text-3xl font-semibold flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-accent" />} {title}
      </h2>
      {children}
    </section>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-card border border-border/50 p-5 shadow-soft">
      <div className="flex items-center gap-2 mb-1.5 text-accent">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-medium uppercase tracking-wide">{title}</p>
      </div>
      <p className="text-sm">{children}</p>
    </div>
  );
}

function Reviews({ destinationId }: { destinationId: string }) {
  const { data } = useSuspenseQuery(reviewsForDestinationQuery(destinationId));
  return (
    <Section title="Traveler reviews">
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Be the first to leave a review.</p>
      ) : (
        <div className="grid gap-4">
          {data.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border/50 p-4">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(r.rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />)}
              </div>
              <p className="text-sm text-foreground/80">{r.comment}</p>
              
              <p className="text-xs text-muted-foreground mt-2">— Wanderly traveler</p>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function Similar({ country, excludeId }: { country: string; excludeId: string }) {
  const { data } = useSuspenseQuery(destinationsQuery());
  const similar = data.filter((d) => d.id !== excludeId).slice(0, 3);
  if (!similar.length) return null;
  return (
    <Section title="Similar destinations">
      <div className="grid sm:grid-cols-3 gap-4">
        {similar.map((s) => (
          <Link key={s.id} to="/destinations/$slug" params={{ slug: s.slug }} className="group">
            <div className="rounded-2xl overflow-hidden aspect-[4/5] relative">
              <img src={s.image_url} alt={s.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs opacity-80">{s.country}</p>
                <p className="font-display font-semibold">{s.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
