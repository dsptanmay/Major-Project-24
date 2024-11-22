import { integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

export const notificationsTable = pgTable("notifications", {
  user_id: varchar({ length: 255 }).notNull(),
  org_id: varchar({ length: 255 }).notNull(),
  nft_token_id: varchar({ length: 255 }).notNull(),
  comments: varchar({ length: 255 }).notNull(),
});

export const organizationWalletTable = pgTable("organization_wallets", {
  organization_name: varchar({ length: 255 }).notNull().primaryKey(),
  wallet_address: varchar({ length: 255 }).notNull().unique(),
});

export const organizationGrantedTokens = pgTable(
  "organization_granted_tokens",
  {
    organization_name: varchar({ length: 255 })
      .notNull()
      .references(() => organizationWalletTable.organization_name),
    token_id: varchar({ length: 255 }).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.organization_name, table.token_id],
      }),
    };
  }
);

export const userNFTsTable = pgTable("user_nfts", {
  tokenId: varchar({ length: 255 }).primaryKey(),
  ownerAddress: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
});
