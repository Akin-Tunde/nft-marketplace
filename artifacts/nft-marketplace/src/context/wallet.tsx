import { createContext, useContext, useState, useEffect, useCallback } from "react";

export const MOCK_WALLETS = [
  { address: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b", label: "Wallet Alpha" },
  { address: "0x9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c", label: "Wallet Beta" },
  { address: "0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d", label: "Wallet Gamma" },
  { address: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f", label: "Wallet Delta" },
  { address: "0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a", label: "Wallet Epsilon" },
];

interface WalletContextValue {
  address: string | null;
  label: string | null;
  connect: (address: string, label: string) => void;
  disconnect: () => void;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextValue>({
  address: null,
  label: null,
  connect: () => {},
  disconnect: () => {},
  isConnected: false,
});

const STORAGE_KEY = "mint_wallet_address";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [label, setLabel] = useState<string | null>(() => {
    if (!address) return null;
    return MOCK_WALLETS.find((w) => w.address === address)?.label ?? "Custom Wallet";
  });

  const connect = useCallback((addr: string, lbl: string) => {
    setAddress(addr);
    setLabel(lbl);
    try {
      localStorage.setItem(STORAGE_KEY, addr);
    } catch {}
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setLabel(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <WalletContext.Provider
      value={{ address, label, connect, disconnect, isConnected: !!address }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
