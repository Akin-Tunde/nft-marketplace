import { useState, useEffect } from "react";

export interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  label: string;
  urgency: "normal" | "warning" | "critical";
}

function compute(expiresAt: string): CountdownResult {
  const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  const isExpired = diff === 0;

  let label: string;
  if (isExpired) {
    label = "Expired";
  } else if (hours > 0) {
    label = `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    label = `${minutes}m ${seconds}s`;
  } else {
    label = `${seconds}s`;
  }

  const urgency: "normal" | "warning" | "critical" =
    diff === 0 ? "critical" : diff < 3600 ? "critical" : diff < 6 * 3600 ? "warning" : "normal";

  return { hours, minutes, seconds, totalSeconds: diff, isExpired, label, urgency };
}

export function useCountdown(expiresAt: string): CountdownResult {
  const [result, setResult] = useState<CountdownResult>(() => compute(expiresAt));

  useEffect(() => {
    setResult(compute(expiresAt));
    const interval = setInterval(() => {
      const next = compute(expiresAt);
      setResult(next);
      if (next.isExpired) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return result;
}
