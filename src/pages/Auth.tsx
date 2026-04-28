import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ChevronRight, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AppShell from "@/components/w2w/AppShell";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/home", { replace: true });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/home", { replace: true });
    });

    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async () => {
    if (!email || password.length < 6) {
      toast.error("Enter email and 6+ character password");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
            data: {
              name: name || email.split("@")[0],
            },
          },
        });

        if (error) throw error;

        sessionStorage.setItem("w2w_just_signed_up", "1");
        toast.success("Welcome to Waste2Worth!");

        if (data.session) {
          navigate("/home", { replace: true });
        } else {
          toast.message("Please check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("Welcome back!");
        navigate("/home", { replace: true });
      }
    } catch (e: any) {
      toast.error(e.message ?? "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell hideNav>
      <div className="min-h-screen flex flex-col px-6 pt-10 pb-6 gradient-hero text-primary-foreground">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Recycle className="h-5 w-5" />
          </div>
          <div className="font-extrabold text-lg tracking-tight">
            Waste2Worth
          </div>
        </div>

        <div className="mt-8 fade-in">
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
            {mode === "signup" ? "Turn waste into worth" : "Welcome back"}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-white/85">
            {mode === "signup"
              ? "Create an account to start earning W2W coins."
              : "Sign in to continue earning."}
          </p>

          <div className="mt-8 bg-card text-foreground rounded-2xl p-4 shadow-card space-y-3">
            {mode === "signup" && (
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl font-semibold"
              />
            )}

            <div className="flex items-center gap-2 rounded-xl border border-border px-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-0 bg-transparent font-semibold focus-visible:ring-0"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border px-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password (6+ chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-0 bg-transparent font-semibold focus-visible:ring-0"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            onClick={submit}
            disabled={loading}
            size="lg"
            className="w-full h-14 rounded-2xl bg-card text-foreground hover:bg-card/90 text-base font-bold shadow-elevated"
          >
            {loading
              ? "Please wait…"
              : mode === "signup"
              ? "Create account"
              : "Sign in"}
            <ChevronRight className="ml-1 h-5 w-5" />
          </Button>

          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="w-full text-center text-sm text-white/85 underline-offset-2 hover:underline"
          >
            {mode === "signup"
              ? "Have an account? Sign in"
              : "New here? Create an account"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}