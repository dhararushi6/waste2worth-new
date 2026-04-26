import AppShell from "@/components/w2w/AppShell";
import { user, badges } from "@/lib/w2w-data";
import { Settings, Bell, Shield, Share2, IdCard, Leaf, TreeDeciduous, Cloud, Flame, ChevronRight, Sparkles, Zap, Droplets, Smartphone, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useW2W, w2wStore } from "@/store/w2w-store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
  const totalKg = useW2W((s) => s.totalKg);
  const navigate = useNavigate();

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
          <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-extrabold">
            {user.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold">{user.name}</h1>
            <p className="text-xs opacity-85">{user.hostel} · {user.department}</p>
            <p className="text-[10px] opacity-75 mt-0.5">ID {user.studentId}</p>
          </div>
        </div>
      </header>

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

      {/* Leaderboard */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold flex items-center gap-1.5"><Trophy className="h-4 w-4 text-gold" /> Leaderboard</h2>
          <div className="flex bg-muted rounded-full p-0.5">
            {[
              { id: "hostel", label: "Hostels" },
              { id: "dept", label: "Depts" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setBoard(t.id as any)}
                className={cn("px-3 py-1 rounded-full text-[11px] font-bold", board === t.id ? "bg-card shadow-card text-foreground" : "text-muted-foreground")}
              >{t.label}</button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          {list.map((r, i) => {
            const isMe = r.name === myName;
            return (
              <div key={r.name} className={cn("flex items-center gap-3 px-4 py-3 border-b border-border last:border-0", isMe && "bg-primary/10")}>
                <span className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-extrabold",
                  i === 0 ? "bg-gold text-gold-foreground" : i === 1 ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"
                )}>{i + 1}</span>
                <p className={cn("flex-1 text-sm font-semibold", isMe && "text-primary")}>{r.name}{isMe && " · you"}</p>
                <p className="text-sm font-extrabold">{r.kg} kg</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workshops shortcut */}
      <section className="px-5 mt-6">
        <button onClick={() => navigate("/workshops")} className="w-full rounded-2xl bg-card border border-border p-4 shadow-card flex items-center gap-3 text-left">
          <span className="h-10 w-10 rounded-xl bg-gold/20 text-gold flex items-center justify-center">🛠️</span>
          <div className="flex-1">
            <p className="text-sm font-bold">Workshop Hub</p>
            <p className="text-xs text-muted-foreground">Trash to Treasure, Repair Cafe & more</p>
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
