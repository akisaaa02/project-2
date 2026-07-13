import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plane } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Wanderly Travels" },
      { name: "description", content: "Sign in or create your Wanderly Travels account to book trips and save destinations." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ redirect: (s.redirect as string) || "/dashboard" }),
  component: AuthPage,
});

type Mode = "login" | "register" | "forgot";

const emailSchema = z.string().trim().email("Enter a valid email").max(160);
const passwordSchema = z.string().min(6, "Min 6 characters").max(72);

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const e = emailSchema.safeParse(email);
        if (!e.success) throw new Error(e.error.issues[0].message);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("Check your email for a reset link");
        setMode("login");
        return;
      }
      const ep = emailSchema.safeParse(email);
      if (!ep.success) throw new Error(ep.error.issues[0].message);
      const pp = passwordSchema.safeParse(password);
      if (!pp.success) throw new Error(pp.error.issues[0].message);

      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Welcome to Wanderly!");
        navigate({ to: redirect });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back ✈️");
        navigate({ to: redirect });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-hero-gradient grid place-items-center px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="rounded-full bg-primary-gradient p-2"><Plane className="h-4 w-4 text-primary-foreground" /></div>
          <span className="font-display text-xl font-semibold">Wanderly</span>
        </Link>
        <div className="rounded-3xl bg-card shadow-elegant border border-border/50 p-7">
          <h1 className="font-display text-3xl font-semibold text-center mb-1">
            {mode === "login" ? "Welcome back" : mode === "register" ? "Create your account" : "Reset password"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {mode === "login" ? "Sign in to manage your trips" : mode === "register" ? "Start planning your next journey" : "We'll send you a reset link"}
          </p>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "register" && (
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="input" required />
            )}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input" required />
            {mode !== "forgot" && (
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input" required />
            )}
            <Button disabled={loading} className="w-full rounded-full bg-primary-gradient text-primary-foreground h-11">
              {loading ? "Please wait..." : mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground space-y-2">
            {mode === "login" && (<>
              <button onClick={() => setMode("forgot")} className="text-primary hover:underline">Forgot password?</button>
              <p>No account? <button onClick={() => setMode("register")} className="text-primary hover:underline">Create one</button></p>
            </>)}
            {mode === "register" && (
              <p>Already have an account? <button onClick={() => setMode("login")} className="text-primary hover:underline">Sign in</button></p>
            )}
            {mode === "forgot" && (
              <button onClick={() => setMode("login")} className="text-primary hover:underline">Back to sign in</button>
            )}
          </div>
        </div>
        <style>{`.input { width:100%; border-radius:9999px; border:1px solid var(--color-border); background:var(--color-background); padding:0.75rem 1.25rem; font-size:0.875rem; outline:none; }
.input:focus { box-shadow: 0 0 0 3px oklch(0.56 0.12 220 / 0.2); }`}</style>
      </div>
    </div>
  );
}
