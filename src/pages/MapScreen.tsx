import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Navigation, List, Map as MapIcon, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AppShell from "@/components/w2w/AppShell";
import { kiosks } from "@/lib/w2w-data";
import { toast } from "sonner";
import { w2wStore } from "@/store/w2w-store";

export default function MapScreen() {
  const navigate = useNavigate();
  const [view, setView] = useState<"map" | "list">("map");
  const [active, setActive] = useState<typeof kiosks[number] | null>(null);

  return (
    <AppShell>
      {/* Header */}
      <header className="bg-deep-blue text-deep-blue-foreground rounded-b-3xl px-5 pt-12 pb-5 shadow-card">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold">Find a Smart Kiosk</h1>
          <button onClick={() => setView(view === "map" ? "list" : "map")} className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
            {view === "map" ? <List className="h-5 w-5" /> : <MapIcon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {view === "map" ? (
        <div className="px-5 mt-4">
          {/* Stylized map */}
          <div className="relative h-80 rounded-2xl overflow-hidden border border-border shadow-card bg-[hsl(95_22%_88%)]">
            {/* Grid pattern */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M32 0H0V32" fill="none" stroke="hsl(95 18% 78%)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#g)" />
              {/* Roads */}
              <path d="M0 60 Q200 80 440 50" stroke="hsl(95 14% 70%)" strokeWidth="14" fill="none" />
              <path d="M120 0 L160 320" stroke="hsl(95 14% 70%)" strokeWidth="14" fill="none" />
              <path d="M0 240 L440 220" stroke="hsl(95 14% 70%)" strokeWidth="10" fill="none" />
            </svg>

            {/* User pin */}
            <div className="absolute" style={{ left: "48%", top: "50%" }}>
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-deep-blue opacity-60" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-deep-blue ring-4 ring-white" />
              </span>
            </div>

            {/* Kiosk pins */}
            {kiosks.map((k) => (
              <button
                key={k.id}
                onClick={() => setActive(k)}
                className="absolute -translate-x-1/2 -translate-y-full"
                style={{ left: `${k.x}%`, top: `${k.y}%` }}
              >
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground border-2 border-white shadow-elevated flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-2 w-2 rotate-45 bg-primary border-r-2 border-b-2 border-white" />
                </div>
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-muted-foreground text-center">Tap a green pin to see kiosk details</p>
        </div>
      ) : (
        <div className="px-5 mt-4 space-y-3">
          {kiosks.map((k) => (
            <button
              key={k.id}
              onClick={() => setActive(k)}
              className="w-full text-left rounded-2xl bg-card border border-border p-4 shadow-card flex items-center gap-3"
            >
              <span className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{k.name}</p>
                <p className="text-xs text-muted-foreground">{k.distance} · {k.hours}</p>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${k.fill > 75 ? "bg-destructive" : k.fill > 50 ? "bg-gold" : "bg-primary"}`} style={{ width: `${k.fill}%` }} />
                </div>
              </div>
              <span className="text-xs font-bold text-muted-foreground">{k.fill}%</span>
            </button>
          ))}
        </div>
      )}

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl border-border max-w-[440px] mx-auto">
          {active && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="text-lg font-extrabold">{active.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {active.types.map((t) => (
                    <span key={t} className="text-[11px] font-bold bg-primary/15 text-primary rounded-full px-2.5 py-1">{t}</span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <Stat label="Distance" value={active.distance} />
                  <Stat label="Fill level" value={`${active.fill}%`} />
                  <Stat label="Hours" value={active.hours} />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    onClick={() => { toast.success("Opening directions…"); }}
                    className="h-12 rounded-xl bg-deep-blue text-deep-blue-foreground hover:bg-deep-blue/90 font-bold"
                  >
                    <Navigation className="h-4 w-4 mr-1" /> Get Directions
                  </Button>
                  <Button
                    onClick={() => {
                      w2wStore.addCoins(35);
                      toast.success("+35 W2W coins credited (kiosk QR scanned)");
                      setActive(null);
                    }}
                    className="h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold"
                  >
                    <QrCode className="h-4 w-4 mr-1" /> Scan Kiosk QR
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card-muted border border-border py-2.5">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase">{label}</p>
      <p className="text-xs font-extrabold mt-0.5">{value}</p>
    </div>
  );
}
