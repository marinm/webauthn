import { blob, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const passkeys = sqliteTable("passkeys", {
  id: text().primaryKey(),
  publicKey: blob("public_key"),
  counter: int("counter"),
  transports: text("transports", { mode: "json" }),
  displayName: text("display_name"),
  userId: text("user_id"),
});
