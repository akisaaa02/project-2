import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Plane, Twitter, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/50 bg-muted/40">
      <div className="container mx-auto px-4 py-14 grid gap-10 md:grid-cols-4">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-full bg-primary-gradient p-2">
              <Plane className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold">Wanderly</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            Crafted journeys to every corner of the world — for the curious, the romantic and the bold.
          </p>
          <div className="flex gap-3">
            {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="rounded-full bg-card p-2 shadow-soft hover:bg-primary hover:text-primary-foreground transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/destinations" className="hover:text-foreground">Destinations</Link></li>
            <li><Link to="/packages" className="hover:text-foreground">Packages</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About us</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5" /> 16 Lamachaur, Pokhara</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +977 061533288</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@wanderly.travel</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Newsletter</h4>
          <p className="text-sm text-muted-foreground mb-3">Postcards from the road, monthly.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem("email") as HTMLInputElement);
              if (input.value) {
                input.value = "";
                import("sonner").then(({ toast }) => toast.success("Subscribed — check your inbox!"));
              }
            }}
            className="flex gap-2"
          >
            <input
              name="email"
              type="email"
              required
              placeholder="you@email.com"
              className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="rounded-full bg-accent-gradient px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-border/50">
        <div className="container mx-auto px-4 py-5 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Wanderly Travels. All rights reserved.</span>
          <span>Made for wanderers, with care.</span>
        </div>
      </div>
    </footer>
  );
}
