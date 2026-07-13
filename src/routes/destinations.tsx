import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { Suspense, useState } from "react";
import { DestinationCard } from "@/components/DestinationCard";
import { destinationsQuery } from "@/lib/queries";

export const Route = createFileRoute("/destinations")({
  head: () => ({
    meta: [
      { title: "All Destinations — Wanderly Travels" },
      { name: "description", content: "Browse 200+ travel destinations across every continent. Filter by country, price, duration and rating." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ q: (s.q as string) || "" }),
  component: DestinationsPage,
});

const CONTINENTS = ["all", "Asia", "Europe", "Africa", "North America", "South America", "Oceania"] as const;

function DestinationsPage() {
  const { q } = Route.useSearch();
  const [search, setSearch] = useState(q);
  const [continent, setContinent] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sort, setSort] = useState<"price-asc" | "price-desc" | "rating-desc" | "">("");

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-10 text-center max-w-3xl mx-auto animate-fade-in">
        <p className="text-sm text-accent font-medium mb-2">Explore the world</p>
        <h1 className="font-display text-4xl md:text-6xl font-semibold mb-3">Find your next adventure</h1>
        <p className="text-muted-foreground">From cherry blossoms in Kyoto to aurora skies in Iceland — pick your dream.</p>
      </header>

      <div className="rounded-3xl bg-card border border-border/50 shadow-soft p-4 md:p-6 mb-10 grid gap-4 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="flex items-center gap-2 rounded-full bg-muted px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country, city or vibe..."
            className="flex-1 bg-transparent py-3 text-sm outline-none"
          />
        </div>
        <select value={continent} onChange={(e) => setContinent(e.target.value)} className="rounded-full bg-muted px-4 py-3 text-sm outline-none">
          {CONTINENTS.map((c) => <option key={c} value={c}>{c === "all" ? "All continents" : c}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-full bg-muted px-4 py-3 text-sm outline-none">
          <option value="">Sort by</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating-desc">Highest rated</option>
        </select>
      </div>

      <Suspense fallback={<Skeleton />}>
        <Results search={search} continent={continent} maxPrice={maxPrice} sort={sort || undefined} />
      </Suspense>
    </div>
  );
}

function Results({ search, continent, maxPrice, sort }: { search: string; continent: string; maxPrice: number; sort?: "price-asc" | "price-desc" | "rating-desc" }) {
  const { data } = useSuspenseQuery(destinationsQuery({ search, continent, maxPrice, sort }));
  if (!data.length) return <p className="text-center text-muted-foreground py-20">No destinations match your filters yet.</p>;
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((d) => <DestinationCard key={d.id} d={d} />)}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => <div key={i} className="rounded-3xl bg-muted/50 h-96 animate-pulse" />)}
    </div>
  );
}
