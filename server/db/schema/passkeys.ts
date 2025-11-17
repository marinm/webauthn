import { blob, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { AuthenticatorTransportFuture } from "@simplewebauthn/server";

export const passkeys = sqliteTable("passkeys", {
  id: text().primaryKey(),
  publicKey: blob("public_key").notNull().$type<Uint8Array>(),
  counter: int("counter").notNull(),
  transports: text("transports", { mode: "json" }).$type<
    AuthenticatorTransportFuture[]
  >(),
  displayName: text("display_name").notNull(),
  userId: text("user_id").notNull(),
});
