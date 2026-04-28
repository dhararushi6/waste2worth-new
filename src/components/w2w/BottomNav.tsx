import { useLocation, useNavigate } from "react-router-dom";
import { Home, ScanLine, Gift, User, Clock, Plus, X, Camera, Truck, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/scan", label: "Scan", icon: ScanLine },
  { to: "/history", label: "History", icon: Clock },  // Clock works in all versions
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
      {fabOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setFabOpen(false)}
          className="fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm"
        />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[440px]">
        {/* FAB action menu */}
        <div className={cn(
          "absolute right-5 bottom-28 flex flex-col items-end gap-2.5 transition-all",
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
        <nav className="pointer-events-auto mx-3 mb-3 rounded-2xl bg-card shadow-elevated border border-border px-1.5 py-1.5 flex items-center justify-between">
          {tabs.map((t) => (
            <NavBtn key={t.to} {...t} active={pathname === t.to} onClick={() => navigate(t.to)} />
          ))}
        </nav>

        {/* FAB — bottom right */}
        <button
          onClick={() => setFabOpen((v) => !v)}
          aria-label="Quick actions"
          className={cn(
            "pointer-events-auto absolute right-5 bottom-20",
            "h-14 w-14 rounded-full gradient-fab shadow-fab text-white",
            "flex items-center justify-center transition-transform",
            fabOpen && "rotate-45"
          )}
        >
          {fabOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </button>
      </div>
    </>
  );
}

function NavBtn({ label, icon: Icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors",
        active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
    </button>
  );
}