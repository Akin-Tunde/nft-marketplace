import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { WalletProvider } from "@/context/wallet";
import { WatchlistProvider } from "@/context/watchlist";

import Home from "@/pages/home";
import Explore from "@/pages/explore";
import Collections from "@/pages/collections";
import Activity from "@/pages/activity";
import Create from "@/pages/create";
import NftDetail from "@/pages/nft-detail";
import CollectionDetail from "@/pages/collection-detail";
import MyNfts from "@/pages/my-nfts";
import Watchlist from "@/pages/watchlist";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/explore" component={Explore} />
        <Route path="/collections" component={Collections} />
        <Route path="/collections/:id" component={CollectionDetail} />
        <Route path="/nfts/:id" component={NftDetail} />
        <Route path="/activity" component={Activity} />
        <Route path="/create" component={Create} />
        <Route path="/my-nfts" component={MyNfts} />
        <Route path="/watchlist" component={Watchlist} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WalletProvider>
          <WatchlistProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </WatchlistProvider>
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
