import { z } from "zod";
export const HealthCheckResponse = z.object({ status: z.string() });
export const ListNftsQueryParams = z.object({
  collectionId: z.coerce.number().optional(),
  isListed: z.coerce.boolean().optional(),
  sort: z.enum(["newest", "oldest", "price_asc", "price_desc"]).optional(),
});
export const CreateNftBody = z.object({
  title: z.string(),
  description: z.string().optional(),
  image: z.string(),
  collectionId: z.number().optional(),
  owner: z.string(),
  royaltyPercent: z.number().optional(),
});
export const GetNftParams = z.object({ id: z.number() });
export const ListNftForSaleParams = z.object({ id: z.number() });
export const ListNftForSaleBody = z.object({ price: z.string() });
export const BuyNftParams = z.object({ id: z.number() });
export const BuyNftBody = z.object({ buyer: z.string() });
export const CreateCollectionBody = z.object({
  name: z.string(),
  description: z.string().optional(),
  creator: z.string(),
  coverImage: z.string().optional(),
});
export const GetCollectionParams = z.object({ id: z.number() });
export const ListActivityQueryParams = z.object({ limit: z.number().optional() });
export const MakeOfferParams = z.object({ id: z.number() });
export const MakeOfferBody = z.object({ offererAddress: z.string(), amount: z.string() });
export const AcceptOfferParams = z.object({ id: z.number() });
export const DeclineOfferParams = z.object({ id: z.number() });
export const ListNftOffersParams = z.object({ id: z.number() });
export const ListReceivedOffersQueryParams = z.object({ ownerAddress: z.string() });