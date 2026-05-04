import { useState } from "react";
import { useListActivity } from "@workspace/api-client-react";
import { formatPrice, truncateAddress } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowRightLeft, Tag, ShoppingCart, Paintbrush } from "lucide-react";
import { ActivityEventAction } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const ACTION_CONFIG: Record<
  ActivityEventAction,
  { icon: typeof Paintbrush; label: string; pill: string; dot: string }
> = {
  mint: {
    icon: Paintbrush,
    label: "Mint",
    pill: "bg-sky-500/12 text-sky-400 border-sky-500/20",
    dot: "bg-sky-400",
  },
  list: {
    icon: Tag,
    label: "List",
    pill: "bg-amber-500/12 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  sale: {
    icon: ShoppingCart,
    label: "Sale",
    pill: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  transfer: {
    icon: ArrowRightLeft,
    label: "Transfer",
    pill: "bg-violet-500/12 text-violet-400 border-violet-500/20",
    dot: "bg-violet-400",
  },
};

function EventBadge({ action }: { action: ActivityEventAction }) {
  const cfg = ACTION_CONFIG[action] ?? ACTION_CONFIG.transfer;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border", cfg.pill)}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

type FilterType = ActivityEventAction | "all";

export default function Activity() {
  const { data: activity, isLoading } = useListActivity({ limit: 50 });
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = filter === "all" ? activity : activity?.filter((e) => e.action === filter);

  const filterBtns: { value: FilterType; label: string }[] = [
    { value: "all", label: "All Events" },
    { value: "sale", label: "Sales" },
    { value: "list", label: "Listings" },
    { value: "mint", label: "Mints" },
    { value: "transfer", label: "Transfers" },
  ];

  return (
    <div className="mx-auto max-w-screen-xl px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold">Activity</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Live events across the Mint gallery</p>
        </div>
        {!isLoading && (
          <p className="text-sm text-muted-foreground font-mono">
            <span className="text-foreground font-semibold">{filtered?.length ?? 0}</span> events
          </p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap">
        {filterBtns.map((btn) => {
          const cfg = btn.value !== "all" ? ACTION_CONFIG[btn.value as ActivityEventAction] : null;
          return (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all",
                filter === btn.value
                  ? btn.value === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : cn("border", cfg?.pill.replace("border-", "border ").split(" ")[0], cfg?.pill.split(" ")[1], cfg?.pill.split(" ")[2])
                  : "bg-muted/20 text-muted-foreground border-border/40 hover:bg-muted/40 hover:text-foreground"
              )}
            >
              {cfg && <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />}
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border/40 bg-muted/15">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Event</th>
                <th className="px-5 py-3.5 font-semibold">Item</th>
                <th className="px-5 py-3.5 font-semibold">Price</th>
                <th className="px-5 py-3.5 font-semibold hidden md:table-cell">From</th>
                <th className="px-5 py-3.5 font-semibold hidden md:table-cell">To</th>
                <th className="px-5 py-3.5 font-semibold text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3.5"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-5 py-3.5"><Skeleton className="h-9 w-48" /></td>
                    <td className="px-5 py-3.5"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-5 py-3.5 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-5 py-3.5 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-5 py-3.5 text-right"><Skeleton className="h-4 w-10 ml-auto" /></td>
                  </tr>
                ))
              ) : filtered?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground text-sm">
                    No activity found.
                  </td>
                </tr>
              ) : (
                filtered?.map((event) => (
                  <tr key={event.id} className="hover:bg-muted/8 transition-colors group">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <EventBadge action={event.action} />
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/nfts/${event.nftId}`} className="flex items-center gap-3 w-fit">
                        <div className="w-9 h-9 rounded-lg bg-muted overflow-hidden flex-shrink-0 border border-border/30">
                          {event.nftImage ? (
                            <img src={event.nftImage} alt={event.nftTitle} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted/50" />
                          )}
                        </div>
                        <span className="font-medium text-sm line-clamp-1 max-w-[180px] group-hover:text-primary transition-colors">
                          {event.nftTitle}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-sm">
                      {event.price ? (
                        <span className="font-semibold">{formatPrice(event.price)}</span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-muted-foreground hidden md:table-cell">
                      {event.fromAddress ? truncateAddress(event.fromAddress) : <span className="opacity-30">—</span>}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-muted-foreground hidden md:table-cell">
                      {event.toAddress ? truncateAddress(event.toAddress) : <span className="opacity-30">—</span>}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs text-muted-foreground">
                      {new Date(event.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
