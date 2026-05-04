import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Paintbrush, Compass, LayoutGrid, Activity, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/wallet-button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/collections", label: "Collections", icon: LayoutGrid },
    { href: "/activity", label: "Activity", icon: Activity },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto px-4 md:px-6 h-16 flex items-center gap-4 max-w-screen-2xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0 mr-2" data-testid="link-home">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:opacity-90 transition-opacity">
              <Paintbrush className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight hidden sm:block">Mint</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-0.5 mr-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || location.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                    isActive
                      ? "text-foreground bg-muted/70"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                  data-testid={`link-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary/80 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search bar — grows in center */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                placeholder='Search items, collections...'
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full h-9 pl-9 pr-10 bg-muted/30 border border-border/40 rounded-xl text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/40 font-mono hidden lg:block">
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Mobile search icon */}
          <button
            className="md:hidden ml-auto text-muted-foreground hover:text-foreground transition-colors p-2"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <Link href="/create">
              <Button
                size="sm"
                className="hidden sm:flex gap-1.5 h-8 text-xs font-medium"
                data-testid="button-create"
              >
                <Plus className="w-3.5 h-3.5" />
                Create
              </Button>
            </Link>
            <WalletButton />
          </div>
        </div>

        {/* Mobile search overlay */}
        {searchOpen && (
          <div className="md:hidden border-t border-border/40 px-4 py-3 bg-background/95">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search items, collections..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full h-10 pl-10 pr-10 bg-muted/30 border border-border/40 rounded-xl text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 py-12 mt-12 bg-muted/5">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                  <Paintbrush className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-serif text-lg font-bold">Mint</span>
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                The premier destination for digital creators and discerning collectors.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Marketplace</p>
              <div className="flex flex-col gap-2">
                {[
                  { href: "/explore", label: "Explore" },
                  { href: "/collections", label: "Collections" },
                  { href: "/activity", label: "Activity" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Create</p>
              <div className="flex flex-col gap-2">
                <Link href="/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Mint NFT</Link>
                <Link href="/my-nfts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">My Collection</Link>
                <Link href="/watchlist" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Watchlist</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Resources</p>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground/50 cursor-not-allowed">Help Center</span>
                <span className="text-sm text-muted-foreground/50 cursor-not-allowed">Blog</span>
                <span className="text-sm text-muted-foreground/50 cursor-not-allowed">Partners</span>
              </div>
            </div>
          </div>
          <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground/50">
              &copy; {new Date().getFullYear()} Mint Marketplace. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground/40 cursor-not-allowed">Privacy Policy</span>
              <span className="text-xs text-muted-foreground/40 cursor-not-allowed">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
