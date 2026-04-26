import { Coins } from "lucide-react";
import { useW2W } from "@/store/w2w-store";
import { cn } from "@/lib/utils";

export default function CoinBadge({ className }: { className?: string }) {
  const coins = useW2W((s) => s.coins);
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full bg-primary/15 text-primary px-2.5 py-1 text-xs font-bold",
      className
    )}>
      <Coins className="h-3.5 w-3.5" />
      {coins.toLocaleString()} W2W
    </span>
  );
}
