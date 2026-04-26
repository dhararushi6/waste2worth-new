import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Sparkles, MapPin, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import AppShell from "@/components/w2w/AppShell";
import CoinBadge from "@/components/w2w/CoinBadge";
import { w2wStore } from "@/store/w2w-store";
import { toast } from "sonner";

const samples = [
  { type: "E-waste – Mobile Phone", purity: 90, baseKg: 0.18, ratePerKg: 400, emoji: "📱" },
  { type: "Plastic – PET Bottles", purity: 84, baseKg: 0.4, ratePerKg: 20, emoji: "🥤" },
  { type: "Paper – Mixed", purity: 78, baseKg: 1.2, ratePerKg: 10, emoji: "📄" },
  { type: "Metal – Aluminum Can", purity: 95, baseKg: 0.12, ratePerKg: 50, emoji: "🥫" },
];

export default function Scan() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<null | (typeof samples[number] & { kg: number })>(null);

  const startScan = () => {
    setScanning(true);
    setTimeout(() => {
      const pick = samples[Math.floor(Math.random() * samples.length)];
      setResult({ ...pick, kg: pick.baseKg });
      setScanning(false);
    }, 1600);
  };

  const coins = result ? Math.round(result.kg * result.ratePerKg * (result.purity / 100)) : 0;

  const deposit = () => {
    if (!result) return;
    w2wStore.addCoins(coins);
    w2wStore.addKg(result.kg);
    w2wStore.addRecent({ id: Date.now(), title: `${result.type} scan`, subtitle: `${result.kg.toFixed(2)} kg`, coins, when: "Just now" });
    toast.success(`+${coins} W2W coins added`);
    navigate("/map");
  };
  const pickup = () => {
    if (!result) return;
    toast.success("Pickup request created");
    navigate("/pickup");
  };

  return (
    <AppShell>
      {/* Camera viewfinder */}
      <div className="relative h-[55vh] bg-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.25),transparent_70%)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Focus frame */}
          <div className="relative h-64 w-64">
            {[
              "top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl",
              "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl",
              "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl",
              "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl",
            ].map((c, i) => (
              <span key={i} className={`absolute h-10 w-10 border-primary ${c}`} />
            ))}
            {scanning && (
              <span className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_20px_hsl(var(--primary))] animate-[scan_1.6s_ease-in-out]"
                style={{ animationName: "scan" }} />
            )}
            <style>{`@keyframes scan { 0%{ top: 0 } 50%{ top: 100% } 100%{ top: 0 } }`}</style>
          </div>
        </div>

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 px-5 pt-12 flex items-center justify-between text-white">
          <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center backdrop-blur">
            <X className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold">AI Waste Scanner</p>
          <div className="h-10 w-10" />
        </div>

        <p className="absolute bottom-6 inset-x-0 text-center text-white/85 text-xs px-8">
          Center the item inside the frame and tap to scan
        </p>
      </div>

      {/* Capture / Result */}
      <div className="px-5 -mt-6">
        {!result ? (
          <div className="flex flex-col items-center">
            <button
              onClick={startScan}
              disabled={scanning}
              className="h-20 w-20 rounded-full bg-card border-4 border-primary shadow-elevated flex items-center justify-center disabled:opacity-60"
            >
              <Camera className="h-8 w-8 text-primary" />
            </button>
            <p className="mt-3 text-xs text-muted-foreground font-semibold">
              {scanning ? "Analyzing with on-device AI…" : "Tap to capture"}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border shadow-elevated p-5 fade-in">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center text-2xl">
                {result.emoji}
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI Detected
                </p>
                <p className="text-base font-extrabold leading-tight">{result.type}</p>
              </div>
              <CoinBadge />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span>Estimated weight</span>
                <span className="text-primary">{result.kg.toFixed(2)} kg</span>
              </div>
              <Slider
                value={[result.kg]}
                min={0.05}
                max={5}
                step={0.05}
                onValueChange={(v) => setResult({ ...result, kg: v[0] })}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="Purity score" value={`${result.purity}%`} />
              <Stat label="You'll earn" value={`+${coins} W2W`} accent />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button onClick={deposit} className="h-12 rounded-xl bg-deep-blue text-deep-blue-foreground hover:bg-deep-blue/90 font-bold">
                <MapPin className="h-4 w-4 mr-1" /> Deposit at Kiosk
              </Button>
              <Button onClick={pickup} className="h-12 rounded-xl bg-olive text-olive-foreground hover:bg-olive/90 font-bold">
                <Truck className="h-4 w-4 mr-1" /> Request Pickup
              </Button>
            </div>

            <button onClick={() => setResult(null)} className="mt-3 w-full text-xs text-muted-foreground font-semibold py-2">
              Scan another item
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-3 border border-border ${accent ? "bg-primary/10" : "bg-card-muted"}`}>
      <p className="text-[11px] text-muted-foreground font-semibold">{label}</p>
      <p className={`text-base font-extrabold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
