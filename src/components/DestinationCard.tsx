import { Link } from "@tanstack/react-router";
import { Clock, Heart, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Dest = {
  id: string;
  slug: string;
  title: string;
  country: string;
  city: string;
  short_description: string;
  image_url: string;
  price: number;
  duration: string;
  rating: number;
};

export function DestinationCard({ d }: { d: Dest }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("wishlist").select("id").eq("destination_id", d.id).maybeSingle().then(({ data }) => setLiked(!!data));
  }, [user, d.id]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Sign in to save destinations");
      return;
    }
    if (liked) {
      await supabase.from("wishlist").delete().eq("destination_id", d.id).eq("user_id", user.id);
      setLiked(false);
      toast("Removed from wishlist");
    } else {
      await supabase.from("wishlist").insert({ destination_id: d.id, user_id: user.id });
      setLiked(true);
      toast.success("Added to wishlist");
    }
  };

  return (
    <article className="group rounded-3xl overflow-hidden bg-card border border-border/50 shadow-soft hover:shadow-elegant transition-all duration-500 hover:-translate-y-1 animate-fade-in">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
  src={d.image_url || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"}
  alt={d.title}
  loading="lazy"
  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
  onError={(e) => {
    const backups = [
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"
    ];
    const index = Math.abs(d.title ? d.title.length % backups.length : 0);
    e.currentTarget.src = backups[index];
  }}
/>
        <button
          onClick={toggleWishlist}
          aria-label="Toggle wishlist"
          className="absolute top-3 right-3 rounded-full glass p-2 hover:scale-110 transition-transform"
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-accent text-accent" : "text-foreground"}`} />
        </button>
        <div className="absolute bottom-3 left-3 rounded-full glass px-3 py-1 text-xs font-medium flex items-center gap-1">
          <Star className="h-3 w-3 fill-accent text-accent" /> {d.rating}
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-semibold leading-tight">{d.title}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {d.city}, {d.country}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">from</p>
            <p className="font-display text-lg font-semibold text-primary">${d.price.toLocaleString()}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{d.short_description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {d.duration}</span>
        </div>
        <div className="pt-1">
      
          <Link to="/booking/$slug" params={{ slug: d.slug }} className="flex-1">
            <Button size="sm" className="w-full rounded-full bg-accent-gradient text-accent-foreground hover:opacity-90">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
