import { z } from "zod";
export declare const HealthCheckResponse: z.ZodObject<{
    status: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status?: string;
}, {
    status?: string;
}>;
export declare const ListNftsQueryParams: z.ZodObject<{
    collectionId: z.ZodOptional<z.ZodNumber>;
    isListed: z.ZodOptional<z.ZodBoolean>;
    sort: z.ZodOptional<z.ZodEnum<["newest", "oldest", "price_asc", "price_desc"]>>;
}, "strip", z.ZodTypeAny, {
    sort?: "newest" | "oldest" | "price_asc" | "price_desc";
    collectionId?: number;
    isListed?: boolean;
}, {
    sort?: "newest" | "oldest" | "price_asc" | "price_desc";
    collectionId?: number;
    isListed?: boolean;
}>;
export declare const CreateNftBody: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    image: z.ZodString;
    collectionId: z.ZodOptional<z.ZodNumber>;
    owner: z.ZodString;
    royaltyPercent: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    collectionId?: number;
    title?: string;
    description?: string;
    image?: string;
    owner?: string;
    royaltyPercent?: number;
}, {
    collectionId?: number;
    title?: string;
    description?: string;
    image?: string;
    owner?: string;
    royaltyPercent?: number;
}>;
export declare const GetNftParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id?: number;
}, {
    id?: number;
}>;
export declare const ListNftForSaleParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id?: number;
}, {
    id?: number;
}>;
export declare const ListNftForSaleBody: z.ZodObject<{
    price: z.ZodString;
}, "strip", z.ZodTypeAny, {
    price?: string;
}, {
    price?: string;
}>;
export declare const BuyNftParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id?: number;
}, {
    id?: number;
}>;
export declare const BuyNftBody: z.ZodObject<{
    buyer: z.ZodString;
}, "strip", z.ZodTypeAny, {
    buyer?: string;
}, {
    buyer?: string;
}>;
export declare const CreateCollectionBody: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    creator: z.ZodString;
    coverImage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description?: string;
    name?: string;
    creator?: string;
    coverImage?: string;
}, {
    description?: string;
    name?: string;
    creator?: string;
    coverImage?: string;
}>;
export declare const GetCollectionParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id?: number;
}, {
    id?: number;
}>;
export declare const ListActivityQueryParams: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit?: number;
}, {
    limit?: number;
}>;
export declare const MakeOfferParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id?: number;
}, {
    id?: number;
}>;
export declare const MakeOfferBody: z.ZodObject<{
    offererAddress: z.ZodString;
    amount: z.ZodString;
}, "strip", z.ZodTypeAny, {
    offererAddress?: string;
    amount?: string;
}, {
    offererAddress?: string;
    amount?: string;
}>;
export declare const AcceptOfferParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id?: number;
}, {
    id?: number;
}>;
export declare const DeclineOfferParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id?: number;
}, {
    id?: number;
}>;
export declare const ListNftOffersParams: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id?: number;
}, {
    id?: number;
}>;
export declare const ListReceivedOffersQueryParams: z.ZodObject<{
    ownerAddress: z.ZodString;
}, "strip", z.ZodTypeAny, {
    ownerAddress?: string;
}, {
    ownerAddress?: string;
}>;
