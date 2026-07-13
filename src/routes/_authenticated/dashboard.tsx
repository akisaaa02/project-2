import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Download, Heart, Loader2, MapPin, Settings, ShieldCheck, Trash2, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { isAdminQuery, myBookingsQuery, wishlistQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard — Wanderly" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

type Tab = "bookings" | "wishlist" | "profile";

function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("bookings");
  const { data: isAdmin } = useQuery(isAdminQuery(user?.id));

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-accent">Welcome back</p>
          <h1 className="font-display text-4xl font-semibold">{user?.email}</h1>
        </div>
        {isAdmin && (
          <Link to="/admin"><Button className="rounded-full bg-primary-gradient text-primary-foreground gap-2"><ShieldCheck className="h-4 w-4" /> Admin Panel</Button></Link>
        )}
      </header>

      <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
        {([
          ["bookings", "My bookings", Calendar],
          ["wishlist", "Wishlist", Heart],
          ["profile", "Profile", UserIcon],
        ] as const).map(([k, l, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === k ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="h-4 w-4" /> {l}
          </button>
        ))}
      </div>

      {tab === "bookings" && <BookingsTab />}
      {tab === "wishlist" && <WishlistTab />}
      {tab === "profile" && <ProfileTab />}
    </div>
  );
}

function BookingsTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(myBookingsQuery(user?.id));

  const cancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Booking cancelled");
    qc.invalidateQueries({ queryKey: ["my-bookings"] });
  };

  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
  if (!data?.length) return <Empty title="No bookings yet" cta="Browse destinations" to="/destinations" />;
  return (
    <div className="space-y-4">
      {data.map((b) => (
        <article key={b.id} className="rounded-3xl bg-card border border-border/50 shadow-soft p-4 sm:p-6 flex gap-4 flex-wrap sm:flex-nowrap">
          
          <img src={b.destinations?.image_url} alt="" className="h-24 w-32 rounded-2xl object-cover" />
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between gap-2 flex-wrap">
              <div>
                
                <h3 className="font-display text-xl font-semibold">{b.destinations?.title}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  
                  <MapPin className="h-3 w-3" /> {b.destinations?.city}, {b.destinations?.country}
                </p>
              </div>
              <span className={`text-xs rounded-full px-3 py-1 self-start ${b.status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"}`}>{b.status}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Ref: <strong>{b.reference}</strong> · {b.travel_date} → {b.return_date}</p>
            <p className="font-display text-lg text-primary mt-1">${Number(b.total_amount).toLocaleString()}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Button size="sm" variant="outline" className="rounded-full gap-1" onClick={() => window.print()}><Download className="h-3.5 w-3.5" /> Receipt</Button>
              {b.status !== "cancelled" && <Button size="sm" variant="ghost" className="rounded-full text-destructive gap-1" onClick={() => cancel(b.id)}><Trash2 className="h-3.5 w-3.5" /> Cancel</Button>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function WishlistTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(wishlistQuery(user?.id));
  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
  if (!data?.length) return <Empty title="Your wishlist is empty" cta="Find something dreamy" to="/destinations" />;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((w) => {
        
        const d = w.destinations;
        if (!d) return null;
        return (
          <Link to="/destinations/$slug" params={{ slug: d.slug }} key={w.destination_id} className="group">
            <div className="rounded-2xl overflow-hidden bg-card border border-border/50 shadow-soft">
              <div className="relative aspect-[4/3]">
                <img src={d.image_url} alt={d.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                <button onClick={async (e) => {
                  e.preventDefault();
                  await supabase.from("wishlist").delete().eq("destination_id", d.id).eq("user_id", user!.id);
                  qc.invalidateQueries({ queryKey: ["wishlist"] });
                }} className="absolute top-2 right-2 rounded-full glass p-1.5">
                  <Heart className="h-4 w-4 fill-accent text-accent" />
                </button>
              </div>
              <div className="p-3">
                <p className="font-semibold">{d.title}</p>
                <p className="text-xs text-muted-foreground">{d.country}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ProfileTab() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
    enabled: !!user,
  });
  const [form, setForm] = useState({ full_name: "", phone: "", nationality: "" });
  if (profile && !form.full_name && (profile.full_name || profile.phone || profile.nationality)) {
    setForm({ full_name: profile.full_name || "", phone: profile.phone || "", nationality: profile.nationality || "" });
  }
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("profiles").update({ ...form, updated_at: new Date().toISOString() }).eq("id", user!.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };
  return (
    <form onSubmit={save} className="max-w-lg rounded-3xl bg-card border border-border/50 shadow-soft p-6 space-y-4">
      <div><label className="text-xs font-medium text-muted-foreground">Full name</label><input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
      <div><label className="text-xs font-medium text-muted-foreground">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      <div><label className="text-xs font-medium text-muted-foreground">Nationality</label><input className="input" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} /></div>
      <Button className="rounded-full bg-primary-gradient text-primary-foreground gap-2"><Settings className="h-4 w-4" /> Save changes</Button>
      <style>{`.input { width:100%; border-radius:0.75rem; border:1px solid var(--color-border); background:var(--color-background); padding:0.625rem 0.875rem; font-size:0.875rem; outline:none; margin-top: 0.25rem; }`}</style>
    </form>
  );
}

function Empty({ title, cta, to }: { title: string; cta: string; to: string }) {
  return (
    <div className="rounded-3xl bg-muted/40 p-10 text-center">
      <p className="font-display text-xl mb-2">{title}</p>
      <Link to={to}><Button className="rounded-full bg-primary-gradient text-primary-foreground">{cta}</Button></Link>
    </div>
  );
}
