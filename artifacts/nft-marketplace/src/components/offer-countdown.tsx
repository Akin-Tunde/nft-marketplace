import { Timer } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";
import { cn } from "@/lib/utils";

interface OfferCountdownProps {
  expiresAt: string;
  className?: string;
  showIcon?: boolean;
}

export function OfferCountdown({ expiresAt, className, showIcon = true }: OfferCountdownProps) {
  const { label, urgency, isExpired } = useCountdown(expiresAt);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-mono tabular-nums",
        urgency === "normal" && "text-muted-foreground",
        urgency === "warning" && "text-yellow-500",
        urgency === "critical" && !isExpired && "text-destructive animate-pulse",
        isExpired && "text-muted-foreground line-through",
        className
      )}
    >
      {showIcon && <Timer className="w-3 h-3 shrink-0" />}
      {label}
    </span>
  );
}

interface OfferExpiryBarProps {
  expiresAt: string;
  totalDuration?: number;
}

export function OfferExpiryBar({ expiresAt, totalDuration = 48 * 3600 }: OfferExpiryBarProps) {
  const { totalSeconds, urgency, isExpired } = useCountdown(expiresAt);
  const pct = Math.max(0, Math.min(100, (totalSeconds / totalDuration) * 100));

  return (
    <div className="w-full h-1 rounded-full bg-muted/60 overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-1000",
          urgency === "normal" && "bg-primary/40",
          urgency === "warning" && "bg-yellow-500/60",
          (urgency === "critical" || isExpired) && "bg-destructive/60"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
