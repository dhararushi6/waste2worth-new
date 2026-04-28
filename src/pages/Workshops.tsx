// src/pages/Workshops.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, CheckCircle, Award, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/w2w/AppShell";
import { workshops, pastWorkshops } from "@/lib/w2w-data";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Workshop = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  tag: string;
};

export default function Workshops() {
  const navigate = useNavigate();
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<Record<string, boolean>>({});

  const loadRegistrations = async (showToast = false) => {
    setLoading(true);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session error:", sessionError);
      setLoading(false);
      if (showToast) toast.error("Session error");
      return;
    }
    if (!session?.user) {
      console.log("No active session");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("workshop_registrations")
      .select("workshop_id")
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Failed to load registrations:", error);
      if (showToast) toast.error("Could not load your workshops");
    } else {
      const ids = data?.map(r => r.workshop_id) || [];
      console.log("Loaded workshop IDs:", ids);
      setRegisteredIds(new Set(ids));
      if (showToast && ids.length > 0) toast.success(`Loaded ${ids.length} workshop(s)`);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRegistrations();

    // Re-fetch when the page becomes visible again (e.g., after refresh)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadRegistrations();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const registerForWorkshop = async (workshop: Workshop) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error("Please log in");
      navigate("/");
      return;
    }

    if (registeredIds.has(workshop.id)) {
      toast.info("You are already registered");
      return;
    }

    setRegistering(prev => ({ ...prev, [workshop.id]: true }));

    // Double-check with database
    const { data: existing, error: checkError } = await supabase
      .from("workshop_registrations")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("workshop_id", workshop.id)
      .maybeSingle();

    if (checkError) {
      console.error(checkError);
      toast.error("Could not verify registration status");
      setRegistering(prev => ({ ...prev, [workshop.id]: false }));
      return;
    }

    if (existing) {
      toast.info("You are already registered");
      setRegisteredIds(prev => new Set([...prev, workshop.id]));
      setRegistering(prev => ({ ...prev, [workshop.id]: false }));
      return;
    }

    const { error } = await supabase
      .from("workshop_registrations")
      .insert({
        user_id: session.user.id,
        workshop_id: workshop.id,
        workshop_title: workshop.title,
      });

    setRegistering(prev => ({ ...prev, [workshop.id]: false }));

    if (error) {
      if (error.code === "23505") {
        toast.info("You are already registered (duplicate prevented)");
        setRegisteredIds(prev => new Set([...prev, workshop.id]));
      } else {
        console.error(error);
        toast.error(error.message || "Registration failed");
      }
      return;
    }

    setRegisteredIds(prev => new Set([...prev, workshop.id]));
    toast.success(`Registered for ${workshop.title}!`);
  };

  const registeredWorkshops = workshops.filter(w => registeredIds.has(w.id));
  const upcomingWorkshops = workshops.filter(w => !registeredIds.has(w.id));

  if (loading) {
    return (
      <AppShell>
        <div className="p-4 text-center">Loading your workshops...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="bg-gold text-gold-foreground rounded-b-3xl px-5 pt-12 pb-5 shadow-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs opacity-80">Workshop Hub</p>
            <h1 className="text-xl font-extrabold">Learn. Build. Earn.</h1>
          </div>
          <button
            onClick={() => loadRegistrations(true)}
            className="ml-auto h-10 w-10 rounded-xl bg-foreground/10 flex items-center justify-center"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="px-5 mt-4 pb-32">
        {/* My Workshops Section */}
        {registeredWorkshops.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              My Workshops
            </h2>
            <div className="space-y-2">
              {registeredWorkshops.map((w) => (
                <div
                  key={w.id}
                  className="rounded-2xl bg-card border border-border p-3 shadow-sm flex items-center gap-3"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center text-2xl">
                    🎓
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{w.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {w.date} • {w.time}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {w.location}
                    </p>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Registered
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Workshops (available for registration) */}
        <div>
          <h2 className="text-sm font-bold mb-2">Upcoming events</h2>
          {upcomingWorkshops.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">
              No upcoming workshops at the moment. Check back soon!
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingWorkshops.map((w) => (
                <div key={w.id} className="rounded-2xl bg-card border border-border p-4 shadow-card">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 rounded-xl bg-primary text-primary-foreground flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold opacity-80 uppercase">
                        {w.date.split(" ")[0]}
                      </span>
                      <span className="text-lg font-extrabold leading-none">
                        {w.date.split(" ")[1]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/15 rounded-full px-2 py-0.5">
                        {w.tag}
                      </span>
                      <p className="mt-1 text-sm font-extrabold leading-tight">{w.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {w.time}
                      </p>
                      <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {w.location}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => registerForWorkshop(w)}
                    disabled={registering[w.id] || registeredIds.has(w.id)}
                    className="mt-3 w-full h-10 rounded-xl font-bold text-xs"
                  >
                    {registering[w.id] 
                      ? "Registering..." 
                      : registeredIds.has(w.id) 
                        ? "Registered" 
                        : "Register"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Workshops */}
        <div className="mt-6">
          <h2 className="text-sm font-bold mb-2">Past workshops</h2>
          <div className="space-y-2">
            {pastWorkshops.map((w) => (
              <div
                key={w.id}
                className="rounded-2xl bg-card border border-border p-3.5 shadow-card flex items-center gap-3"
              >
                <div className="h-12 w-12 rounded-xl bg-card-muted flex items-center justify-center text-xl">
                  📸
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{w.title}</p>
                  <p className="text-xs text-muted-foreground">{w.date}</p>
                </div>
                {w.certificate && (
                  <button
                    onClick={() => toast.info("Certificate download coming soon")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-gold bg-gold/15 rounded-full px-2.5 py-1.5"
                  >
                    <Award className="h-3.5 w-3.5" /> Cert
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}