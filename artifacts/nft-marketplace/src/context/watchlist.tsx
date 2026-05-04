import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useWallet } from "@/context/wallet";

export interface WatchlistEntry {
  nftId: number;
  savedPrice: string | null;
  savedAt: string;
}

interface WatchlistContextValue {
  entries: WatchlistEntry[];
  isWatched: (nftId: number) => boolean;
  toggle: (nftId: number, currentPrice: string | null | undefined) => void;
  getEntry: (nftId: number) => WatchlistEntry | undefined;
  count: number;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

const STORAGE_KEY = "mint_watchlist";

function loadAll(): Record<string, WatchlistEntry[]> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, WatchlistEntry[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { address } = useWallet();
  const [entriesByWallet, setEntriesByWallet] = useState<Record<string, WatchlistEntry[]>>(loadAll);

  // Sync to localStorage whenever state changes
  useEffect(() => {
    saveAll(entriesByWallet);
  }, [entriesByWallet]);

  const walletKey = address?.toLowerCase() ?? "__guest__";
  const entries = entriesByWallet[walletKey] ?? [];

  const isWatched = (nftId: number) => entries.some((e) => e.nftId === nftId);

  const getEntry = (nftId: number) => entries.find((e) => e.nftId === nftId);

  const toggle = (nftId: number, currentPrice: string | null | undefined) => {
    setEntriesByWallet((prev) => {
      const current = prev[walletKey] ?? [];
      const exists = current.some((e) => e.nftId === nftId);
      const next = exists
        ? current.filter((e) => e.nftId !== nftId)
        : [
            ...current,
            {
              nftId,
              savedPrice: currentPrice ?? null,
              savedAt: new Date().toISOString(),
            },
          ];
      return { ...prev, [walletKey]: next };
    });
  };

  return (
    <WatchlistContext.Provider value={{ entries, isWatched, toggle, getEntry, count: entries.length }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used inside WatchlistProvider");
  return ctx;
}
