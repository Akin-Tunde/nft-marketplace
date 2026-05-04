import { pgTable, serial, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
export const actionEnum = pgEnum("action", ["mint", "list", "sale", "transfer"]);
export const offerStatusEnum = pgEnum("offer_status", ["pending", "accepted", "declined", "expired"]);
export const collectionsTable = pgTable("collections", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    creator: text("creator").notNull(),
    coverImage: text("cover_image"),
    floorPrice: text("floor_price"),
    totalVolume: text("total_volume").default("0").notNull(),
    itemCount: integer("item_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const nftsTable = pgTable("nfts", {
    id: serial("id").primaryKey(),
    tokenId: text("token_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    image: text("image").notNull(),
    price: text("price"),
    owner: text("owner").notNull(),
    collectionId: integer("collection_id").references(() => collectionsTable.id),
    isListed: boolean("is_listed").default(false).notNull(),
    royaltyPercent: integer("royalty_percent").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const activityTable = pgTable("activity", {
    id: serial("id").primaryKey(),
    nftId: integer("nft_id").notNull().references(() => nftsTable.id),
    fromAddress: text("from_address"),
    toAddress: text("to_address"),
    price: text("price"),
    action: actionEnum("action").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const offersTable = pgTable("offers", {
    id: serial("id").primaryKey(),
    nftId: integer("nft_id").notNull().references(() => nftsTable.id),
    offererAddress: text("offerer_address").notNull(),
    amount: text("amount").notNull(),
    status: offerStatusEnum("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const db = {};
