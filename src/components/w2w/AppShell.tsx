import { ReactNode } from "react";
import BottomNav from "./BottomNav";

export default function AppShell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="min-h-screen w-full bg-secondary/30 flex justify-center overflow-x-hidden">
      <div className="app-shell sm:shadow-elevated overflow-x-hidden">
        <div className={hideNav ? "" : "pb-36"}>{children}</div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
