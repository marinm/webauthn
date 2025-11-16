import crypto from "crypto";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import { usersTable } from "./schema/users";

const db = drizzle(process.env.DB_FILE_NAME!);

export async function testDrizzle() {
  const user: typeof usersTable.$inferInsert = {
    id: crypto.randomUUID(),
    name: "John",
  };
  await db.insert(usersTable).values(user);
  console.log("New user created!");
  const users = await db.select().from(usersTable);
  console.log("Getting all users from the database: ", users);
  await db
    .update(usersTable)
    .set({
      name: "Johnathan",
    })
    .where(eq(usersTable.id, user.id));
  console.log("User info updated!");
  await db.delete(usersTable).where(eq(usersTable.id, user.id));
  console.log("User deleted!");
}
