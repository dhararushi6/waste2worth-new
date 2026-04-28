import AppShell from "@/components/w2w/AppShell";
import { user, badges } from "@/lib/w2w-data";
import { Settings, Bell, Shield, Share2, IdCard, Leaf, TreeDeciduous, Cloud, Flame, ChevronRight, Sparkles, Zap, Droplets, Smartphone, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useW2W, w2wStore } from "@/store/w2w-store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Profile() {
  const totalKg = useW2W((s) => s.totalKg);
  const name = useW2W((s) => s.name);
  const city = useW2W((s) => s.city);
  const navigate = useNavigate();

  // Show one-time confirmation after signup, once the name is loaded from DB
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("w2w_just_signed_up") === "1" && name) {
      setJustSaved(true);
      sessionStorage.removeItem("w2w_just_signed_up");
    }
  }, [name]);

  // Real-world impact translations
  const phoneCharges = Math.round(totalKg * 18);
  const litersWater = Math.round(totalKg * 42);
  const bulbHours = Math.round(totalKg * 27);

  const quests = [
    { id: 1, title: "Scan 5 e-waste items", reward: 80, progress: 3, total: 5, icon: "📱" },
    { id: 2, title: "Visit 3 different kiosks", reward: 60, progress: 2, total: 3, icon: "📍" },
    { id: 3, title: "Recycle 5 kg this week", reward: 120, progress: 3.2, total: 5, icon: "♻️" },
  ];

  return (
    <AppShell>
      <header className="bg-primary text-primary-foreground rounded-b-3xl px-5 pt-12 pb-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-extrabold shrink-0">
            {(name?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold truncate">{name || "Your name"}</h1>
            <p className="text-xs opacity-85 truncate">📍 {city}</p>
            <p className="text-[10px] opacity-75 mt-0.5">ID {user.studentId}</p>
          </div>
        </div>
      </header>

      {justSaved && (
        <section className="px-5 mt-4">
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3.5 flex items-start gap-3 fade-in">
            <span className="h-9 w-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-primary">Account saved to database</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hi <span className="font-bold text-foreground">{name}</span> — your profile is live and now showing here.
              </p>
            </div>
            <button
              onClick={() => setJustSaved(false)}
              className="h-7 w-7 rounded-lg hover:bg-primary/15 text-primary flex items-center justify-center shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="px-5 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={Leaf} label="Total recycled" value={`${totalKg} kg`} tone="bg-primary/15 text-primary" />
          <Stat icon={Cloud} label="CO₂ saved" value={`${user.co2Saved} kg`} tone="bg-deep-blue/15 text-deep-blue" />
          <Stat icon={TreeDeciduous} label="Trees equiv." value={`${user.trees}`} tone="bg-olive/20 text-olive" />
          <Stat icon={Flame} label="Streak" value={`${user.streak} days`} tone="bg-gold/25 text-gold" />
        </div>
      </section>

      {/* Badges */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold">Badges</h2>
          <span className="text-[11px] text-muted-foreground">{badges.filter(b => b.earned).length}/{badges.length} earned</span>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 shadow-card">
          <div className="grid grid-cols-3 gap-3">
            {badges.map((b) => (
              <div key={b.id} className={cn("flex flex-col items-center text-center", !b.earned && "opacity-40 grayscale")}>
                <div className="h-14 w-14 rounded-2xl bg-card-muted border border-border flex items-center justify-center text-2xl">{b.emoji}</div>
                <p className="text-[10px] font-bold mt-1.5 leading-tight">{b.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Eco-Quests */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-gold" /> Weekly Eco-Quests
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted rounded-full px-2 py-0.5">
            Resets in 3d
          </span>
        </div>
        <div className="space-y-2.5">
          {quests.map((q) => {
            const pct = Math.min(100, (q.progress / q.total) * 100);
            const done = pct >= 100;
            return (
              <div key={q.id} className="rounded-2xl bg-card border border-border p-3.5 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-card-muted border border-border flex items-center justify-center text-xl">
                    {q.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold truncate">{q.title}</p>
                      <span className="shrink-0 text-[11px] font-extrabold text-primary bg-primary/15 rounded-full px-2 py-0.5">
                        +{q.reward}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full", done ? "bg-primary" : "gradient-hero")} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground font-semibold">
                      {done ? <span className="text-primary inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Complete · tap to claim</span> : `${q.progress} / ${q.total}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Real-world Impact */}
      <section className="px-5 mt-6">
        <h2 className="text-sm font-bold mb-2 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" /> Your Impact, in real things
        </h2>
        <div className="rounded-2xl overflow-hidden border border-border shadow-card relative bg-gradient-to-br from-primary via-olive to-deep-blue text-primary-foreground">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative p-5">
            <p className="text-[11px] uppercase tracking-wider font-bold opacity-80">You've recycled</p>
            <p className="text-3xl font-extrabold">{totalKg} kg</p>
            <p className="text-xs opacity-85 mt-0.5">That's the same as…</p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <ImpactStat icon={Smartphone} value={phoneCharges} label="phone charges" />
              <ImpactStat icon={Droplets} value={litersWater} label="L of water" />
              <ImpactStat icon={Zap} value={bulbHours} label="bulb hours" />
            </div>

            <button
              onClick={() => toast.success("Story image saved — share with friends!")}
              className="mt-4 w-full rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 border border-white/20"
            >
              <Share2 className="h-3.5 w-3.5" /> Share my impact story
            </button>
          </div>
        </div>
      </section>

      {/* Workshops shortcut - only one button now */}
      <section className="px-5 mt-6">
        <button
          onClick={() => navigate("/workshops")}
          className="w-full rounded-2xl bg-card border border-border p-4 shadow-card flex items-center gap-3 text-left"
        >
          <span className="h-10 w-10 rounded-xl bg-gold/20 text-gold flex items-center justify-center text-xl">🛠️</span>
          <div className="flex-1">
            <p className="text-sm font-bold">Workshop Hub</p>
            <p className="text-xs text-muted-foreground">Your workshops & upcoming events</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </section>

      {/* Settings */}
      <section className="px-5 mt-6">
        <h2 className="text-sm font-bold mb-2">Settings</h2>
        <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          {[
            { icon: Bell, label: "Notifications", action: () => toast("Notifications enabled") },
            { icon: IdCard, label: "Linked Student ID", action: () => toast(`ID ${user.studentId}`) },
            { icon: Shield, label: "Privacy", action: () => toast("Privacy settings") },
            { icon: Share2, label: "Invite friends", action: () => toast.success("Invite link copied!") },
            { icon: Settings, label: "Account settings", action: () => toast("Account") },
          ].map((s, i) => (
            <button key={i} onClick={s.action} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/50">
              <span className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center"><s.icon className="h-4 w-4" /></span>
              <span className="flex-1 text-left text-sm font-semibold">{s.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
        <button
          onClick={() => { w2wStore.signOut(); navigate("/"); }}
          className="mt-4 w-full text-center text-sm font-bold text-destructive py-3"
        >Sign out</button>
      </section>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, tone }: any) {
  return (
    <div className="rounded-2xl bg-card border border-border p-3.5 shadow-card">
      <span className={`h-9 w-9 rounded-xl ${tone} flex items-center justify-center`}><Icon className="h-4 w-4" /></span>
      <p className="mt-2 text-[11px] text-muted-foreground font-semibold">{label}</p>
      <p className="text-base font-extrabold">{value}</p>
    </div>
  );
}

function ImpactStat({ icon: Icon, value, label }: { icon: any; value: number; label: string }) {
  return (
    <div className="rounded-xl bg-white/15 backdrop-blur border border-white/20 p-2.5 text-center">
      <Icon className="h-4 w-4 mx-auto opacity-90" />
      <p className="mt-1 text-base font-extrabold leading-none">{value}</p>
      <p className="text-[10px] opacity-85 mt-1 leading-tight">{label}</p>
    </div>
  );
}