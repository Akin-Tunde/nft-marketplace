
import { useQuery, useMutation } from "@tanstack/react-query";

export type Nft = {
  id: number; tokenId: string; title: string; description?: string;
  image: string; price?: string; owner: string; collectionId?: number;
  collectionName?: string; isListed: boolean; royaltyPercent: number; createdAt: string;
};
export type Collection = {
  id: number; name: string; description?: string; creator: string;
  coverImage?: string; floorPrice?: string; totalVolume: string; itemCount: number; createdAt: string;
  nfts: Nft[];
};
export type ActivityEventAction = "mint" | "list" | "sale" | "transfer";

export const useListNfts = (params: any = {}, options: any = {}) => useQuery({ queryKey: ["nfts", params], queryFn: async () => [], ...options });
export const useGetNft = (id: number, options: any = {}) => useQuery({ queryKey: ["nft", id], queryFn: async () => ({} as Nft), ...options });
export const useListCollections = () => useQuery({ queryKey: ["collections"], queryFn: async () => [] });
export const useGetCollection = (id: number, options: any = {}) => useQuery({ queryKey: ["collection", id], queryFn: async () => ({} as Collection), ...options });
export const useListActivity = (params: any = {}) => useQuery({ queryKey: ["activity", params], queryFn: async () => [] });
export const useGetMarketplaceStats = () => useQuery({ queryKey: ["stats"], queryFn: async () => ({ totalVolume: "0", totalNfts: 0, totalCollections: 0, uniqueOwners: 0 }) });
export const useListNftOffers = (id: number, options: any = {}) => useQuery({ queryKey: ["offers", id], queryFn: async () => [], ...options });
export const useListReceivedOffers = (params: any, options: any = {}) => useQuery({ queryKey: ["received-offers", params], queryFn: async () => [], ...options });

export const useCreateNft = () => useMutation({ mutationFn: async (data: any) => ({} as Nft) });
export const useBuyNft = () => useMutation({ mutationFn: async (data: any) => ({}) });
export const useListNftForSale = () => useMutation({ mutationFn: async (data: any) => ({}) });
export const useCreateCollection = () => useMutation({ mutationFn: async (data: any) => ({} as Collection) });
export const useMakeOffer = () => useMutation({ mutationFn: async (data: any) => ({}) });
export const useAcceptOffer = () => useMutation({ mutationFn: async (data: any) => ({}) });
export const useDeclineOffer = () => useMutation({ mutationFn: async (data: any) => ({}) });

export const getListNftsQueryKey = (params: any = {}) => ["nfts", params];
export const getGetNftQueryKey = (id: number) => ["nft", id];
export const getGetCollectionQueryKey = (id: number) => ["collection", id];
export const getListReceivedOffersQueryKey = (params: any) => ["received-offers", params];
export const getListNftOffersQueryKey = (id: number) => ["offers", id];
