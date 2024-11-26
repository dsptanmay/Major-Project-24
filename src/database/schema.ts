import { pgEnum, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";

export const status = pgEnum("status", ["approved", "pending", "denied"]);

export const notificationsTable = pgTable(
  "notifications",
  {
    from_id: varchar({ length: 255 }).notNull(),
    to_id: varchar({ length: 255 }).notNull(),
    nft_token_id: varchar({ length: 255 }).notNull(),
    comments: varchar({ length: 255 }).notNull(),
    status: status().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.from_id, table.to_id, table.nft_token_id],
      }),
    };
  }
);

export const organizationWalletTable = pgTable("organization_wallets", {
  organization_name: varchar({ length: 255 }).notNull().primaryKey(),
  wallet_address: varchar({ length: 255 }).notNull().unique(),
});

export const organizationGrantedTokens = pgTable(
  "granted_tokens_org",
  {
    org_name: varchar({ length: 255 })
      .notNull()
      .references(() => organizationWalletTable.organization_name),
    token_id: varchar({ length: 255 }).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.org_name, table.token_id],
      }),
    };
  }
);

export const userNFTsTable = pgTable("user_files", {
  token_id: varchar({ length: 255 }).primaryKey(),
  user_address: varchar({ length: 255 }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
});

export const userEncryptionsKeysTable = pgTable("user_encryptions", {
  user_address: varchar({ length: 255 }).primaryKey(),
  encryption_key: varchar({ length: 255 }).notNull(),
});
