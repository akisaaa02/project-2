import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const destinationsQuery = (filters?: {
  search?: string;
  continent?: string;
  maxPrice?: number;
  sort?: "price-asc" | "price-desc" | "rating-desc";
}) =>
  queryOptions({
    queryKey: ["destinations", filters ?? {}],
    queryFn: async () => {
      let q = supabase.from("destinations").select("*");
      if (filters?.continent && filters.continent !== "all") q = q.eq("continent", filters.continent);
      if (filters?.maxPrice) q = q.lte("price", filters.maxPrice);
      if (filters?.search) {
        const s = `%${filters.search}%`;
        q = q.or(`title.ilike.${s},country.ilike.${s},city.ilike.${s}`);
      }
      if (filters?.sort === "price-asc") q = q.order("price", { ascending: true });
      else if (filters?.sort === "price-desc") q = q.order("price", { ascending: false });
      else if (filters?.sort === "rating-desc") q = q.order("rating", { ascending: false });
      else q = q.order("featured", { ascending: false }).order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

export const featuredDestinationsQuery = () =>
  queryOptions({
    queryKey: ["destinations", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("featured", true)
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

export const destinationBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: ["destination", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const packagesQuery = () =>
  queryOptions({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("packages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const myBookingsQuery = (userId?: string) =>
  queryOptions({
    queryKey: ["my-bookings", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, destinations(title, country, city, image_url, slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const reviewsForDestinationQuery = (destinationId?: string) =>
  queryOptions({
    queryKey: ["reviews", destinationId],
    enabled: !!destinationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("destination_id", destinationId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

export const wishlistQuery = (userId?: string) =>
  queryOptions({
    queryKey: ["wishlist", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("destination_id, destinations(*)");
      if (error) throw error;
      return data ?? [];
    },
  });

export const isAdminQuery = (userId?: string) =>
  queryOptions({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
  });
