import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AppShell from "@/components/w2w/AppShell";
import CoinBadge from "@/components/w2w/CoinBadge";
import { rewardCategories, rewards } from "@/lib/w2w-data";
import { useW2W, w2wStore } from "@/store/w2w-store";
import { toast } from "sonner";
import { Coins, Check, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Rewards() {
  const coins = useW2W((s) => s.coins);
  const [cat, setCat] = useState("experiences");
  const [confirm, setConfirm] = useState<typeof rewards[number] | null>(null);
  const [coupon, setCoupon] = useState<{ name: string; code: string } | null>(null);

  const list = useMemo(() => rewards.filter((r) => r.cat === cat), [cat]);

  const redeem = (r: typeof rewards[number]) => {
    const ok = w2wStore.spendCoins(r.cost);
    if (!ok) {
      toast.error("Not enough W2W coins");
      setConfirm(null);
      return;
    }
    const code = "W2W-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    w2wStore.addCoupon({ id: code, rewardName: r.name, cost: r.cost, code, createdAt: Date.now() });
    setConfirm(null);
    setCoupon({ name: r.name, code });
  };

  return (
    <AppShell>
      <header className="bg-primary text-primary-foreground rounded-b-3xl px-5 pt-12 pb-6 shadow-card">
        <p className="text-xs opacity-80">Rewards Store</p>
        <h1 className="text-xl font-extrabold">Spend your W2W</h1>
        <div className="mt-4 rounded-2xl bg-white/15 backdrop-blur p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] opacity-80">Available balance</p>
            <p className="text-2xl font-extrabold mt-0.5 flex items-center gap-2">
              <Coins className="h-6 w-6" /> {coins.toLocaleString()}
            </p>
          </div>
          <span className="rounded-full bg-gold text-gold-foreground text-[10px] font-bold uppercase px-2.5 py-1">Gold tier</span>
        </div>
      </header>

      {/* Categories */}
      <div className="px-5 mt-4 -mx-1 overflow-x-auto">
        <div className="flex gap-2 px-1 pb-1">
          {rewardCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition",
                cat === c.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/50"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reward grid — Eco-Experiences get a premium full-width treatment */}
      {cat === "experiences" ? (
        <section className="px-5 mt-4 space-y-3">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-gold/10 to-deep-blue/10 border border-border p-3 flex items-start gap-3">
            <span className="text-xl">✨</span>
            <p className="text-xs text-foreground/80 leading-relaxed">
              <span className="font-bold text-foreground">Eco-Experiences</span> turn your recycling into real-life adventures — only unlockable here. Limited slots every week.
            </p>
          </div>
          {list.map((r: any) => {
            const affordable = coins >= r.cost;
            return (
              <div key={r.id} className="relative rounded-2xl overflow-hidden border border-border shadow-card bg-card">
                <div className="flex">
                  <div className="w-24 shrink-0 bg-gradient-to-br from-primary via-olive to-deep-blue flex items-center justify-center text-5xl">
                    {r.emoji}
                  </div>
                  <div className="flex-1 p-3.5 min-w-0">
                    {r.tag && (
                      <span className="inline-block text-[9px] font-extrabold tracking-widest uppercase text-gold-foreground bg-gold rounded-full px-2 py-0.5 mb-1">
                        {r.tag}
                      </span>
                    )}
                    <p className="text-sm font-extrabold leading-tight">{r.name}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-primary inline-flex items-center gap-1">
                        <Coins className="h-3.5 w-3.5" /> {r.cost.toLocaleString()} W2W
                      </p>
                      <Button
                        disabled={!affordable}
                        onClick={() => setConfirm(r)}
                        size="sm"
                        className="h-8 rounded-lg bg-foreground text-background hover:bg-foreground/90 font-bold text-[11px] px-3 disabled:opacity-40"
                      >
                        {affordable ? "Unlock" : `Need ${(r.cost - coins).toLocaleString()}`}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="px-5 mt-4 grid grid-cols-2 gap-3">
          {list.map((r) => {
            const affordable = coins >= r.cost;
            return (
              <div key={r.id} className="rounded-2xl bg-card border border-border p-3 shadow-card flex flex-col">
                <div className="aspect-square rounded-xl bg-card-muted flex items-center justify-center text-5xl">
                  {r.emoji}
                </div>
                <p className="mt-2.5 text-sm font-bold leading-tight">{r.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                  <Coins className="h-3 w-3 text-primary" /> {r.cost} W2W
                </p>
                <Button
                  disabled={!affordable}
                  onClick={() => setConfirm(r)}
                  className="mt-2.5 h-9 rounded-lg bg-gold text-gold-foreground hover:bg-gold/90 font-bold text-xs disabled:opacity-50"
                >
                  {affordable ? "Redeem" : "Need more"}
                </Button>
              </div>
            );
          })}
        </section>
      )}

      {/* Confirm dialog */}
      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="max-w-[380px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Redeem {confirm?.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{confirm?.cost} W2W</span> will be deducted from your balance.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button variant="outline" onClick={() => setConfirm(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={() => confirm && redeem(confirm)} className="rounded-xl bg-primary hover:bg-primary/90">Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Coupon dialog */}
      <Dialog open={!!coupon} onOpenChange={(o) => !o && setCoupon(null)}>
        <DialogContent className="max-w-[380px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Check className="h-4 w-4" /></span>
              Coupon ready
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm font-semibold">{coupon?.name}</p>
          <div className="mt-2 rounded-2xl bg-card-muted border border-border p-5 flex items-center justify-center">
            <FakeQR seed={coupon?.code || ""} />
          </div>
          <p className="text-center text-xs text-muted-foreground">Show this QR to canteen / partner staff</p>
          <p className="text-center font-mono text-sm font-bold">{coupon?.code}</p>
          <Button onClick={() => { toast.success("Saved to your coupons"); setCoupon(null); }} className="rounded-xl bg-primary hover:bg-primary/90">
            <Download className="h-4 w-4 mr-1" /> Save Coupon
          </Button>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function FakeQR({ seed }: { seed: string }) {
  // Deterministic 12x12 pattern from seed
  const cells = useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return Array.from({ length: 144 }, (_, i) => {
      h = (h * 1103515245 + 12345) >>> 0;
      return (h >> 16) & 1;
    });
  }, [seed]);
  return (
    <div className="grid grid-cols-12 gap-[2px] p-2 bg-white rounded-xl">
      {cells.map((c, i) => (
        <span key={i} className={cn("h-3.5 w-3.5 rounded-[2px]", c ? "bg-foreground" : "bg-white")} />
      ))}
    </div>
  );
}
