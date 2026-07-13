import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, CheckCircle2, Download, Plane } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { destinationBySlugQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/booking/$slug")({
  loader: async ({ context, params }) => {
    const d = await context.queryClient.ensureQueryData(destinationBySlugQuery(params.slug));
    if (!d) throw notFound();
  },
  component: BookingPage,
  notFoundComponent: () => <div className="container mx-auto px-4 py-20 text-center">Destination not found.</div>,
  errorComponent: ({ error }) => <div className="container mx-auto px-4 py-20 text-center">Couldn't load booking: {error.message}</div>,
});

const schema = z.object({
  traveler_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(5).max(30),
  nationality: z.string().trim().max(60).optional(),
  passport_number: z.string().trim().max(30).optional(),
  adults: z.number().int().min(1).max(20),
  children: z.number().int().min(0).max(20),
  travel_date: z.string().min(1),
  return_date: z.string().min(1),
  hotel_preference: z.string().max(50).optional(),
  flight_class: z.string().max(30).optional(),
  special_requests: z.string().max(500).optional(),
});

function BookingPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dest } = useSuspenseQuery(destinationBySlugQuery(slug));
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState({
    traveler_name: "",
    email: user?.email || "",
    phone: "",
    nationality: "",
    passport_number: "",
    adults: 1,
    children: 0,
    travel_date: "",
    return_date: "",
    hotel_preference: "Standard",
    flight_class: "Economy",
    special_requests: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ reference: string } | null>(null);

  if (!dest) return null;
  const totalTravelers = form.adults + form.children;
  const total = Number(dest.price) * totalTravelers;
  const flightMultiplier = form.flight_class === "Business" ? 1.5 : form.flight_class === "First" ? 2 : 1;
  const grandTotal = Math.round(total * flightMultiplier);

  // Prefill name from profile
  if (profile && !form.traveler_name && profile.full_name) {
    setForm((f) => ({ ...f, traveler_name: profile.full_name || "", phone: profile.phone || f.phone, nationality: profile.nationality || f.nationality }));
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please fill all required fields");
      return;
    }
    if (new Date(form.return_date) <= new Date(form.travel_date)) {
      toast.error("Return date must be after travel date");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.from("bookings").insert({
      ...parsed.data,
      user_id: user!.id,
      destination_id: dest.id,
      total_amount: grandTotal,
    }).select("reference").single();
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSuccess({ reference: data.reference });
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-xl mx-auto rounded-3xl bg-card border border-border/50 shadow-elegant p-10 text-center animate-scale-in">
          <div className="rounded-full bg-accent/15 p-4 w-20 h-20 mx-auto mb-4 grid place-items-center">
            <CheckCircle2 className="h-10 w-10 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-semibold mb-2">Booking confirmed!</h1>
          <p className="text-muted-foreground mb-5">Your adventure to <strong>{dest.title}</strong> is all set.</p>
          <div className="rounded-2xl bg-muted p-5 text-left space-y-1 mb-6">
            <p className="text-xs text-muted-foreground">Booking reference</p>
            <p className="font-display text-2xl font-semibold text-primary">{success.reference}</p>
            <p className="text-xs text-muted-foreground mt-3">Total paid · ${grandTotal.toLocaleString()}</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={() => navigate({ to: "/dashboard" })} className="rounded-full bg-primary-gradient text-primary-foreground">View my bookings</Button>
            <Button variant="outline" onClick={() => window.print()} className="rounded-full gap-2"><Download className="h-4 w-4" /> Receipt</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="text-center max-w-2xl mx-auto mb-8 animate-fade-in">
        <p className="text-sm text-accent font-medium mb-2">Just a few details</p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold">Book your trip to {dest.city}</h1>
      </header>
      <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_360px] gap-8 max-w-6xl mx-auto">
        <div className="rounded-3xl bg-card border border-border/50 shadow-soft p-6 md:p-8 space-y-5">
          <Section title="Destination">
            <div className="flex items-center gap-3 rounded-2xl bg-muted p-3">
              <img src={dest.image_url} alt={dest.title} className="h-16 w-16 rounded-xl object-cover" />
              <div>
                <p className="font-semibold">{dest.title}</p>
                <p className="text-xs text-muted-foreground">{dest.city}, {dest.country} · {dest.duration}</p>
              </div>
            </div>
          </Section>

          <Section title="Traveler details">
            <Grid2>
              <Field label="Full name"><input className="input" required value={form.traveler_name} onChange={(e) => setForm({ ...form, traveler_name: e.target.value })} /></Field>
              <Field label="Email"><input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="Phone"><input type="tel" className="input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Nationality"><input className="input" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} /></Field>
              <Field label="Passport number"><input className="input" value={form.passport_number} onChange={(e) => setForm({ ...form, passport_number: e.target.value })} /></Field>
            </Grid2>
          </Section>

          <Section title="Group">
            <Grid2>
              <Field label="Adults"><input type="number" min={1} max={20} className="input" value={form.adults} onChange={(e) => setForm({ ...form, adults: +e.target.value })} /></Field>
              <Field label="Children"><input type="number" min={0} max={20} className="input" value={form.children} onChange={(e) => setForm({ ...form, children: +e.target.value })} /></Field>
            </Grid2>
          </Section>

          <Section title="Dates">
            <Grid2>
              <Field label="Travel date"><input type="date" className="input" required value={form.travel_date} onChange={(e) => setForm({ ...form, travel_date: e.target.value })} /></Field>
              <Field label="Return date"><input type="date" className="input" required value={form.return_date} onChange={(e) => setForm({ ...form, return_date: e.target.value })} /></Field>
            </Grid2>
          </Section>

          <Section title="Preferences">
            <Grid2>
              <Field label="Hotel"><select className="input" value={form.hotel_preference} onChange={(e) => setForm({ ...form, hotel_preference: e.target.value })}><option>Standard</option><option>Premium</option><option>Luxury</option></select></Field>
              <Field label="Flight class"><select className="input" value={form.flight_class} onChange={(e) => setForm({ ...form, flight_class: e.target.value })}><option>Economy</option><option>Business</option><option>First</option></select></Field>
            </Grid2>
            <Field label="Special requests"><textarea rows={3} className="input resize-none" value={form.special_requests} onChange={(e) => setForm({ ...form, special_requests: e.target.value })} placeholder="Dietary needs, accessibility, surprises..." /></Field>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-24 self-start">
          <div className="rounded-3xl bg-card border border-border/50 shadow-elegant p-6 space-y-3">
            <h3 className="font-display text-lg font-semibold">Payment summary</h3>
            <Row label={`${dest.duration} · ${totalTravelers} traveler${totalTravelers > 1 ? "s" : ""}`} value={`$${total.toLocaleString()}`} />
            {flightMultiplier > 1 && <Row label={`${form.flight_class} upgrade`} value={`×${flightMultiplier}`} />}
            <div className="border-t border-border pt-3 flex justify-between font-display text-2xl">
              <span>Total</span><span className="text-primary">${grandTotal.toLocaleString()}</span>
            </div>
            <Button disabled={submitting} className="w-full rounded-full bg-accent-gradient text-accent-foreground h-12 gap-2">
              {submitting ? "Processing..." : <>Confirm booking <Plane className="h-4 w-4" /></>}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">By booking you agree to our terms. Free cancellation 30+ days out.</p>
          </div>
        </aside>
      </form>
      <style>{`.input { width:100%; border-radius:0.75rem; border:1px solid var(--color-border); background:var(--color-background); padding:0.625rem 0.875rem; font-size:0.875rem; outline:none; }
.input:focus { box-shadow: 0 0 0 3px oklch(0.56 0.12 220 / 0.18); }`}</style>
</div>
 );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="space-y-3"><h2 className="font-display text-lg font-semibold">{title}</h2>{children}</div>;
}
function Grid2({ children }: { children: React.ReactNode }) { return <div className="grid sm:grid-cols-2 gap-3">{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}
