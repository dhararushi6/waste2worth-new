import { ReactNode } from "react";
import BottomNav from "./BottomNav";

export default function AppShell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="app-shell shadow-elevated">
        <div className={hideNav ? "" : "pb-32"}>{children}</div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
