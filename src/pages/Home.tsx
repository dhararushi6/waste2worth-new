import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, Recycle, HandHeart, Truck, MapPin, Trophy } from "lucide-react";
import AppShell from "@/components/w2w/AppShell";
import CoinBadge from "@/components/w2w/CoinBadge";
import { user, scrapRates, challenges } from "@/lib/w2w-data";
import { useW2W } from "@/store/w2w-store";

export default function Home() {
  const navigate = useNavigate();
  const recent = useW2W((s) => s.recent);
  const recentList = recent.length ? recent : [
    { id: 1, title: "Mobile Phone scan", subtitle: "E-waste · 0.18 kg", coins: 72, when: "2h ago" },
    { id: 2, title: "Plastic bottles deposit", subtitle: "Kiosk · Block C", coins: 24, when: "Yesterday" },
    { id: 3, title: "Paper bundle pickup", subtitle: "Hostel · 1.2 kg", coins: 12, when: "2 days ago" },
  ];

  const actions = [
    { label: "Sell E-Waste", icon: Recycle, color: "bg-olive text-olive-foreground", to: "/scan" },
    { label: "Donate Device", icon: HandHeart, color: "bg-gold text-gold-foreground", to: "/pickup" },
    { label: "Book Pickup", icon: Truck, color: "bg-olive text-olive-foreground", to: "/pickup" },
    { label: "Find Center", icon: MapPin, color: "bg-deep-blue text-deep-blue-foreground", to: "/map" },
  ];

  return (
    <AppShell>
      {/* Header */}
      <header className="bg-primary text-primary-foreground rounded-b-3xl px-5 pt-12 pb-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs/4 opacity-80">Good morning</p>
            <h1 className="text-xl font-extrabold tracking-tight">Hi, {user.name} 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25">
              <Bell className="h-5 w-5" />
            </button>
            <button onClick={() => navigate("/profile")} className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center font-bold">
              {user.name[0]}
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-xs opacity-80">Your balance</p>
            <CoinBadge className="mt-1 bg-white/20 text-white text-sm" />
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">Streak</p>
            <p className="text-base font-extrabold">🔥 {user.streak} days</p>
          </div>
        </div>
      </header>

      {/* Quick actions */}
      <section className="px-5 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.to)}
              className="rounded-2xl bg-card border border-border p-4 shadow-card text-left hover:scale-[1.01] transition active:scale-[0.99]"
            >
              <span className={`h-10 w-10 rounded-xl flex items-center justify-center ${a.color}`}>
                <a.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-bold">{a.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Tap to start</p>
            </button>
          ))}
        </div>
      </section>

      {/* Live rates ticker */}
      <section className="mt-5">
        <div className="px-5 mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold">Live scrap rates</h2>
          <span className="text-[10px] font-semibold text-muted-foreground bg-muted rounded-full px-2 py-0.5">LIVE</span>
        </div>
        <div className="overflow-hidden bg-card-muted border-y border-border py-2">
          <div className="ticker-track flex gap-6 whitespace-nowrap pl-5 w-max">
            {[...scrapRates, ...scrapRates].map((r, i) => (
              <span key={i} className="text-sm font-semibold text-foreground">
                <span className="text-muted-foreground">{r.type}</span>{" "}
                <span className="text-primary">₹{r.rate}/{r.unit}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="px-5 mt-5">
        <div className="rounded-2xl border border-border p-4 bg-gradient-to-br from-primary/15 to-secondary/40">
          <div className="flex items-start gap-3">
            <span className="h-10 w-10 rounded-xl bg-gold text-gold-foreground flex items-center justify-center">
              <Trophy className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">{challenges.title}</p>
              <p className="text-sm font-semibold mt-0.5">{challenges.body}</p>
              <div className="mt-3 h-2 rounded-full bg-card overflow-hidden">
                <div className="h-full gradient-hero" style={{ width: `${challenges.progress}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">{challenges.progress}% to leaderboard #1</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent activity */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold">Recent activity</h2>
          <button className="text-xs font-semibold text-primary inline-flex items-center">
            View all <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-2">
          {recentList.slice(0, 3).map((r) => (
            <div key={r.id} className="rounded-2xl bg-card border border-border p-3.5 shadow-card flex items-center gap-3">
              <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Recycle className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{r.title}</p>
                <p className="text-xs text-muted-foreground truncate">{r.subtitle} · {r.when}</p>
              </div>
              <span className="text-sm font-extrabold text-primary">+{r.coins}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
