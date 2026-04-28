import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Coins,
  Clock,
  Gift,
  History as HistoryIcon,
  PackageCheck,
  Recycle,
  Truck,
} from "lucide-react";

import AppShell from "@/components/w2w/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Scan = {
  id: string;
  device_name: string;
  weight_kg: number;
  condition_pct: number;
  condition_label?: string;
  coins_earned: number;
  created_at: string;
};

type Redemption = {
  id: string;
  reward_name: string;
  cost: number;
  code?: string;
  created_at: string;
};

type Pickup = {
  id: string;
  address: string;
  pickup_date: string | null;
  slot: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export default function History() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);

  const [openScans, setOpenScans] = useState(true);
  const [openRewards, setOpenRewards] = useState(false);
  const [openPickups, setOpenPickups] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: scansData } = await supabase
      .from("scans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: redeemData } = await supabase
      .from("redemptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: pickupData } = await supabase
      .from("pickups")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setScans(scansData || []);
    setRedemptions(redeemData || []);
    setPickups(pickupData || []);
    setLoading(false);
  };

  const totalEarned = scans.reduce((sum, s) => sum + Number(s.coins_earned || 0), 0);
  const totalSpent = redemptions.reduce((sum, r) => sum + Number(r.cost || 0), 0);
  const totalPickups = pickups.length;

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <HistoryIcon className="h-10 w-10 mx-auto text-primary animate-pulse" />
            <p className="mt-3 text-sm font-semibold text-muted-foreground">
              Loading your activity...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-background pb-32">
        <header className="bg-primary text-primary-foreground rounded-b-3xl px-5 pt-12 pb-7 shadow-card">
          <p className="text-xs opacity-80">Waste2Worth</p>
          <h1 className="text-2xl font-extrabold mt-1">Activity History</h1>
          <p className="text-sm opacity-85 mt-1">
            Track scans, redeemed rewards, and pickup requests.
          </p>

          <div className="grid grid-cols-3 gap-2 mt-5">
            <SummaryCard label="Earned" value={`+${totalEarned}`} />
            <SummaryCard label="Spent" value={`-${totalSpent}`} />
            <SummaryCard label="Pickups" value={`${totalPickups}`} />
          </div>
        </header>

        <main className="px-5 mt-5 space-y-4">
          <DropdownSection
            title="Scans"
            subtitle={`${scans.length} deposited devices`}
            icon={<Recycle className="h-5 w-5" />}
            open={openScans}
            onClick={() => setOpenScans(!openScans)}
          >
            {scans.length === 0 ? (
              <EmptyState text="No scans yet. Scan a device to start earning." />
            ) : (
              <div className="space-y-3">
                {scans.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-2xl bg-card border border-border p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <PackageCheck className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{s.device_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {Number(s.weight_kg || 0).toFixed(2)} kg •{" "}
                          {s.condition_pct}% condition
                          {s.condition_label ? ` • ${s.condition_label}` : ""}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          <span className="inline-flex items-center gap-1 text-sm font-extrabold text-primary">
                            <Coins className="h-4 w-4" /> +{s.coins_earned} W2W
                          </span>

                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(s.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DropdownSection>

          <DropdownSection
            title="Rewards"
            subtitle={`${redemptions.length} redeemed rewards`}
            icon={<Gift className="h-5 w-5" />}
            open={openRewards}
            onClick={() => setOpenRewards(!openRewards)}
          >
            {redemptions.length === 0 ? (
              <EmptyState text="No rewards redeemed yet." />
            ) : (
              <div className="space-y-3">
                {redemptions.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl bg-card border border-border p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-xl bg-gold/20 text-gold-foreground flex items-center justify-center">
                        <Gift className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{r.reward_name}</p>

                        {r.code && (
                          <p className="text-xs font-mono bg-muted rounded-lg px-2 py-1 mt-2 inline-block">
                            {r.code}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-extrabold text-destructive">
                            -{r.cost} W2W
                          </span>

                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DropdownSection>

          <DropdownSection
            title="Pickups"
            subtitle={`${pickups.length} pickup requests`}
            icon={<Truck className="h-5 w-5" />}
            open={openPickups}
            onClick={() => setOpenPickups(!openPickups)}
          >
            {pickups.length === 0 ? (
              <EmptyState text="No pickup requests yet." />
            ) : (
              <div className="space-y-3">
                {pickups.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl bg-card border border-border p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 rounded-xl bg-olive/20 text-olive flex items-center justify-center">
                        <Truck className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold leading-tight">{p.address}</p>
                          <StatusBadge status={p.status} />
                        </div>

                        <p className="text-xs text-muted-foreground mt-2">
                          {p.pickup_date || "No date selected"} •{" "}
                          {p.slot || "No slot selected"}
                        </p>

                        {p.notes && (
                          <p className="text-xs text-muted-foreground mt-2 bg-muted rounded-lg px-2 py-2">
                            📝 {p.notes}
                          </p>
                        )}

                        <p className="text-[11px] text-muted-foreground mt-3">
                          Requested on{" "}
                          {new Date(p.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DropdownSection>
        </main>
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur px-3 py-3">
      <p className="text-[10px] opacity-80">{label}</p>
      <p className="text-lg font-extrabold mt-0.5">{value}</p>
    </div>
  );
}

function DropdownSection({
  title,
  subtitle,
  icon,
  open,
  onClick,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  open: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-card border border-border shadow-card overflow-hidden">
      <button
        onClick={onClick}
        className="w-full px-4 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </span>

          <div>
            <h2 className="text-base font-extrabold">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {open ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {open && <div className="px-4 pb-4">{children}</div>}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 border border-border px-4 py-6 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase?.() || "requested";

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase",
        normalized === "completed"
          ? "bg-green-100 text-green-700"
          : normalized === "cancelled"
          ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-800"
      )}
    >
      {status || "requested"}
    </span>
  );
}