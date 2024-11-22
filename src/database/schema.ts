import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const notificationsTable = pgTable("notifications", {
  user_id: varchar({ length: 255 }).notNull(),
  org_id: varchar({ length: 255 }).notNull(),
  nft_id: varchar({ length: 255 }).notNull(),
  comments: varchar({ length: 255 }).notNull(),
});
