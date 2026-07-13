import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart3, Calendar, DollarSign, Loader2, MapPin, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { isAdminQuery, destinationsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — Wanderly" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useAuth();
  const { data: isAdmin, isLoading } = useQuery(isAdminQuery(user?.id));
  const [tab, setTab] = useState<"overview" | "destinations" | "bookings" | "users">("overview");

  if (isLoading) return <div className="container mx-auto px-4 py-20"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  //if (!isAdmin) return <Navigate to="/dashboard" />;

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="mb-6">
        <p className="text-sm text-accent">Admin</p>
        <h1 className="font-display text-4xl font-semibold">Wanderly Control Center</h1>
      </header>
      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {(["overview", "destinations", "bookings", "users"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium border-b-2 capitalize whitespace-nowrap ${tab === t ? "border-accent text-foreground" : "border-transparent text-muted-foreground"}`}>
        {t}
          </button>
        ))}
      </div>
      {tab === "overview" && <Overview />}
      {tab === "destinations" && <DestinationsAdmin />}
      {tab === "bookings" && <BookingsAdmin />}
      {tab === "users" && <UsersAdmin />}
    </div>
  );
}

function Overview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [d, b, u, rev] = await Promise.all([
        supabase.from("destinations").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("total_amount"),
      ]);
      const revenue = (rev.data ?? []).reduce((s, x) => s + Number(x.total_amount), 0);
      return { destinations: d.count ?? 0, bookings: b.count ?? 0, users: u.count ?? 0, revenue };
    },
  });
  const cards = [
    { icon: MapPin, label: "Destinations", value: stats?.destinations ?? "—" },
    { icon: Calendar, label: "Bookings", value: stats?.bookings ?? "—" },
    { icon: Users, label: "Travelers", value: stats?.users ?? "—" },
    { icon: DollarSign, label: "Revenue", value: stats ? `$${stats.revenue.toLocaleString()}` : "—" },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-3xl bg-card border border-border/50 shadow-soft p-6">
          <c.icon className="h-5 w-5 text-accent mb-2" />
          <p className="text-xs text-muted-foreground">{c.label}</p>
          <p className="font-display text-3xl font-semibold">{c.value}</p>
        </div>
      ))}
      <div className="sm:col-span-2 lg:col-span-4 rounded-3xl bg-card border border-border/50 shadow-soft p-6">
        <div className="flex items-center gap-2 mb-3"><BarChart3 className="h-4 w-4 text-accent" /><h3 className="font-semibold">Revenue trend</h3></div>
        <div className="h-40 rounded-2xl bg-gradient-to-r from-secondary via-secondary/40 to-accent/20" />
      </div>
    </div>
  );
}

function DestinationsAdmin() {
  const { data, isLoading } = useQuery(destinationsQuery());
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", country: "", city: "", continent: "Asia", short_description: "", image_url: "", price: 1000, duration: "7 days" });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("destinations").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Destination added");
    setAdding(false);
    qc.invalidateQueries({ queryKey: ["destinations"] });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this destination?")) return;
    const { error } = await supabase.from("destinations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["destinations"] });
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => setAdding(!adding)} className="rounded-full bg-accent-gradient text-accent-foreground gap-2"><Plus className="h-4 w-4" /> {adding ? "Cancel" : "Add destination"}</Button>
      {adding && (
        <form onSubmit={add} className="rounded-3xl bg-card border border-border/50 p-5 grid sm:grid-cols-2 gap-3">
          {(["title","slug","country","city","short_description","image_url","duration"] as const).map((k) => (
            <input key={k} required placeholder={k} className="input" value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          ))}
          <input type="number" placeholder="price" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
          <select className="input" value={form.continent} onChange={(e) => setForm({ ...form, continent: e.target.value })}>
            {["Asia","Europe","Africa","North America","South America","Oceania"].map((c) => <option key={c}>{c}</option>)}
          </select>
          <Button className="sm:col-span-2 rounded-full bg-primary-gradient text-primary-foreground">Save</Button>
          <style>{`.input { border-radius:0.75rem; border:1px solid var(--color-border); padding:0.5rem 0.75rem; font-size:0.875rem; background:var(--color-background); outline:none; }`}</style>
        </form>
      )}
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
        <div className="rounded-3xl bg-card border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left"><tr><th className="p-3">Title</th><th className="p-3 hidden md:table-cell">Country</th><th className="p-3">Price</th><th className="p-3"></th></tr></thead>
            <tbody>
              {data?.map((d) => (
                <tr key={d.id} className="border-t border-border/50">
                  <td className="p-3">{d.title}</td>
                  <td className="p-3 hidden md:table-cell">{d.country}</td>
                  <td className="p-3">${Number(d.price).toLocaleString()}</td>
                  <td className="p-3 text-right"><Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(d.id)}><Trash2 className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BookingsAdmin() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => (await supabase.from("bookings").select("*, destinations(title, country)").order("created_at", { ascending: false })).data ?? [],
  });
  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
  if (!data?.length) return <p className="text-muted-foreground">No bookings yet.</p>;
  return (
    <div className="rounded-3xl bg-card border border-border/50 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left"><tr><th className="p-3">Ref</th><th className="p-3">Traveler</th><th className="p-3 hidden md:table-cell">Destination</th><th className="p-3">Total</th><th className="p-3">Status</th></tr></thead>
        <tbody>
          {data.map((b) => (
            <tr key={b.id} className="border-t border-border/50">
              <td className="p-3 font-mono text-xs">{b.reference}</td>
              <td className="p-3">{b.traveler_name}</td>
              
              <td className="p-3 hidden md:table-cell">{b.destinations?.title}</td>
              <td className="p-3">${Number(b.total_amount).toLocaleString()}</td>
              <td className="p-3"><span className={`text-xs rounded-full px-2 py-0.5 ${b.status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"}`}>{b.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersAdmin() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
  return (
    <div className="rounded-3xl bg-card border border-border/50 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3 hidden md:table-cell">Joined</th></tr></thead>
        <tbody>
          {data?.map((u) => (
            <tr key={u.id} className="border-t border-border/50">
              <td className="p-3">{u.full_name || "—"}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3 hidden md:table-cell">{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
