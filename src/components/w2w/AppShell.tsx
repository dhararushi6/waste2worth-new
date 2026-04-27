import { ReactNode } from "react";
import BottomNav from "./BottomNav";

export default function AppShell({
  children,
  hideNav = false,
}: {
  children: ReactNode;
  hideNav?: boolean;
}) {
  return (
    <div className="min-h-screen w-full bg-[#eef3ec] flex justify-center overflow-x-hidden">
      <main className="w-full max-w-[430px] min-h-screen bg-white overflow-x-hidden relative shadow-xl">
        <div className={hideNav ? "" : "pb-36"}>{children}</div>
        {!hideNav && <BottomNav />}
      </main>
    </div>
  );
}