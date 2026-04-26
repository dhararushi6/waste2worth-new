import { useLocation, useNavigate } from "react-router-dom";
import { Home, ScanLine, Map as MapIcon, Gift, User, Plus, X, Camera, Truck, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/scan", label: "Scan", icon: ScanLine },
  { to: "/map", label: "Map", icon: MapIcon },
  { to: "/rewards", label: "Rewards", icon: Gift },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [fabOpen, setFabOpen] = useState(false);

  const fabActions = [
    { label: "Scan Waste", icon: Camera, to: "/scan" },
    { label: "Book Pickup", icon: Truck, to: "/pickup" },
    { label: "Report Issue", icon: AlertTriangle, to: "/report" },
  ];

  return (
    <>
      {/* FAB radial menu */}
      {fabOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setFabOpen(false)}
          className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm app-shell !min-h-0 !h-full"
        />
      )}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[440px]">
        {/* FAB action buttons */}
        <div className={cn(
          "absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-all",
          fabOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        )}>
          {fabActions.map((a, i) => (
            <button
              key={a.label}
              onClick={() => { setFabOpen(false); navigate(a.to); }}
              style={{ transitionDelay: `${i * 40}ms` }}
              className="flex items-center gap-2 rounded-full bg-card pl-4 pr-5 py-2.5 shadow-elevated border border-border text-sm font-semibold text-foreground hover:scale-[1.02] transition"
            >
              <a.icon className="h-4 w-4 text-primary" />
              {a.label}
            </button>
          ))}
        </div>

        {/* Bottom Nav */}
        <nav className="pointer-events-auto mx-3 mb-3 rounded-2xl bg-card shadow-elevated border border-border px-2 py-2 flex items-center justify-between">
          {tabs.slice(0, 2).map((t) => <NavBtn key={t.to} {...t} active={pathname === t.to} onClick={() => navigate(t.to)} />)}
          <div className="w-14" /> {/* FAB spacer */}
          {tabs.slice(3).map((t) => <NavBtn key={t.to} {...t} active={pathname === t.to} onClick={() => navigate(t.to)} />)}
        </nav>

        {/* FAB */}
        <button
          onClick={() => setFabOpen((v) => !v)}
          aria-label="Quick actions"
          className={cn(
            "pointer-events-auto absolute left-1/2 -translate-x-1/2 bottom-7",
            "h-16 w-16 rounded-full gradient-fab shadow-fab text-white",
            "flex items-center justify-center transition-transform",
            fabOpen && "rotate-45"
          )}
        >
          {fabOpen ? <X className="h-7 w-7" /> : <Plus className="h-7 w-7" />}
        </button>

        {/* Map tab (under FAB area) — render as small label centered? Actually just include /map as a side icon: */}
      </div>
    </>
  );
}

function NavBtn({ to, label, icon: Icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5", active && "fill-primary/15")} strokeWidth={active ? 2.4 : 1.8} />
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
    </button>
  );
}
