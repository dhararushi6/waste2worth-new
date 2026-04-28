import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  Recycle,
  HandHeart,
  Truck,
  MapPin,
  Trophy,
  X,
  Building2,
  Store,
} from "lucide-react";

import AppShell from "@/components/w2w/AppShell";
import CoinBadge from "@/components/w2w/CoinBadge";
import { useW2W } from "@/store/w2w-store";
import { supabase } from "@/integrations/supabase/client";

export default function Home() {
  const navigate = useNavigate();
  const recent = useW2W((s) => s.recent);

  const [name, setName] = useState("User");
  const [streak] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [showDonateModal, setShowDonateModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  const addNotification = (msg: string) => {
    setNotifications((prev) => [msg, ...prev]);
  };

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();

      if (error) {
        setName(user.email?.split("@")[0] || "User");
      } else {
        setName(data?.name || "User");
      }

      addNotification("👋 Welcome back to Waste2Worth!");
      addNotification("♻️ Scan your e-waste to earn W2W coins.");
      addNotification("🚚 Book a pickup for old devices.");
    };

    loadProfile();
  }, []);

  const userInitial = name.charAt(0).toUpperCase();

  const organizations = [
    {
      name: "Green Hope Foundation",
      desc: "Donates refurbished devices to students.",
    },
    {
      name: "Digital Shiksha Trust",
      desc: "Supports rural learning with reused electronics.",
    },
    {
      name: "EcoTech Recycling NGO",
      desc: "Repairs and responsibly recycles unusable devices.",
    },
  ];

  const ewasteRates = [
    { type: "Smartphone", rate: 400, unit: "device" },
    { type: "Laptop", rate: 1200, unit: "device" },
    { type: "Tablet", rate: 700, unit: "device" },
    { type: "Charger", rate: 40, unit: "piece" },
    { type: "Cables", rate: 25, unit: "kg" },
    { type: "Battery", rate: 80, unit: "piece" },
  ];

  const recentList = recent.length
    ? recent
    : [
        {
          id: 1,
          title: "Old smartphone recycled",
          subtitle: "E-waste · 0.18 kg · Battery safe",
          coins: 72,
          when: "2h ago",
        },
        {
          id: 2,
          title: "Laptop collected",
          subtitle: "E-waste pickup · 1.8 kg",
          coins: 180,
          when: "Yesterday",
        },
        {
          id: 3,
          title: "Charger & cables deposit",
          subtitle: "Accessories · 0.35 kg",
          coins: 35,
          when: "2 days ago",
        },
      ];

  const actions = [
    {
      label: "Sell E-Waste",
      icon: Recycle,
      color: "bg-olive text-olive-foreground",
      onClick: () => navigate("/scan"),
    },
    {
      label: "Donate Device",
      icon: HandHeart,
      color: "bg-gold text-gold-foreground",
      onClick: () => {
        setSelectedOrg(null);
        setShowDonateModal(true);
      },
    },
    {
      label: "Book E-Waste Pickup",
      icon: Truck,
      color: "bg-olive text-olive-foreground",
      onClick: () => navigate("/pickup"),
    },
    {
      label: "Find E-Waste Center",
      icon: MapPin,
      color: "bg-deep-blue text-deep-blue-foreground",
      onClick: () => navigate("/map"),
    },
  ];

  return (
    <AppShell>
      <div className="min-h-screen w-full bg-background overflow-x-hidden pb-28">
        <header className="bg-primary text-primary-foreground rounded-b-3xl px-5 pt-12 pb-8 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">Good morning</p>
              <h1 className="text-xl font-extrabold tracking-tight">
                Hi, {name} 👋
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 relative"
                >
                  <Bell className="h-5 w-5" />

                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] h-4 w-4 rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-64 bg-white text-black rounded-xl shadow-lg p-3 z-50">
                    <h3 className="font-bold mb-2 text-sm">Notifications</h3>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.map((n, i) => (
                        <div
                          key={i}
                          className="text-xs bg-gray-100 p-2 rounded-lg"
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate("/profile")}
                className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center font-bold"
              >
                {userInitial}
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-xs opacity-80">Your balance</p>
              <CoinBadge className="mt-1 bg-white/20 text-white text-sm" />
            </div>

            <div className="text-right">
              <p className="text-xs opacity-80">E-Waste Streak</p>
              <p className="text-base font-extrabold">🔥 {streak} days</p>
            </div>
          </div>
        </header>

        <section className="px-5 -mt-5">
          <div className="grid grid-cols-2 gap-3">
            {actions.map((a) => (
              <button
                key={a.label}
                onClick={a.onClick}
                className="rounded-2xl bg-card border border-border p-4 shadow-card text-left hover:scale-[1.01] transition active:scale-[0.99]"
              >
                <span
                  className={`h-10 w-10 rounded-xl flex items-center justify-center ${a.color}`}
                >
                  <a.icon className="h-5 w-5" />
                </span>

                <p className="mt-3 text-sm font-bold">{a.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Tap to start
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <div className="px-5 mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold">Live E-Waste value</h2>
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              LIVE
            </span>
          </div>

          <div className="overflow-hidden bg-card-muted border-y border-border py-2">
            <div className="ticker-track flex gap-6 whitespace-nowrap pl-5 w-max">
              {[...ewasteRates, ...ewasteRates].map((r, i) => (
                <span key={i} className="text-sm font-semibold text-foreground">
                  <span className="text-muted-foreground">{r.type}</span>{" "}
                  <span className="text-primary">
                    ₹{r.rate}/{r.unit}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 mt-5">
          <div className="rounded-2xl border border-border p-4 bg-gradient-to-br from-primary/15 to-secondary/40">
            <div className="flex items-start gap-3">
              <span className="h-10 w-10 rounded-xl bg-gold text-gold-foreground flex items-center justify-center">
                <Trophy className="h-5 w-5" />
              </span>

              <div className="flex-1">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">
                  E-Waste Rescue Quest
                </p>

                <p className="text-sm font-semibold mt-0.5">
                  Recycle 5 more old devices to unlock a free repair workshop.
                </p>

                <div className="mt-3 h-2 rounded-full bg-card overflow-hidden">
                  <div
                    className="h-full gradient-hero"
                    style={{ width: "68%" }}
                  />
                </div>

                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  68% to monthly e-waste recovery goal
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 mt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">Recent E-Waste activity</h2>

            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-semibold text-primary inline-flex items-center"
            >
              {showAll ? "Show less" : "View all"}{" "}
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {(showAll ? recentList : recentList.slice(0, 3)).map((r) => (
              <div
                key={r.id}
                className="rounded-2xl bg-card border border-border p-3.5 shadow-card flex items-center gap-3"
              >
                <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Recycle className="h-5 w-5" />
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {r.subtitle} · {r.when}
                  </p>
                </div>

                <span className="text-sm font-extrabold text-primary">
                  +{r.coins}
                </span>
              </div>
            ))}
          </div>
        </section>

        {showDonateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center px-4">
            <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-extrabold">Donate Device</h2>
                  <p className="text-xs text-muted-foreground">
                    Choose an organization first
                  </p>
                </div>

                <button
                  onClick={() => setShowDonateModal(false)}
                  className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {organizations.map((org) => (
                  <button
                    key={org.name}
                    onClick={() => {
                      setSelectedOrg(org.name);
                      addNotification(`💚 Selected ${org.name} for donation.`);
                    }}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedOrg === org.name
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="h-10 w-10 rounded-xl bg-gold text-gold-foreground flex items-center justify-center">
                        <Building2 className="h-5 w-5" />
                      </span>

                      <div>
                        <p className="text-sm font-bold">{org.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {org.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedOrg && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      addNotification(
                        `🚚 Pickup selected for donation to ${selectedOrg}.`
                      );
                      setShowDonateModal(false);
                      navigate("/pickup");
                    }}
                    className="rounded-2xl bg-primary text-primary-foreground p-4 font-bold text-sm flex flex-col items-center gap-2"
                  >
                    <Truck className="h-5 w-5" />
                    Book Pickup
                  </button>

                  <button
                    onClick={() => {
                      addNotification(
                        `🏪 Kiosk drop selected for donation to ${selectedOrg}.`
                      );
                      setShowDonateModal(false);
                      navigate("/map");
                    }}
                    className="rounded-2xl bg-card border border-border p-4 font-bold text-sm flex flex-col items-center gap-2"
                  >
                    <Store className="h-5 w-5" />
                    Kiosk Drop
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}