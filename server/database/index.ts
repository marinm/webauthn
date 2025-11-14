import fs from "fs";
import path from "path";
import DatabaseConstructor from "better-sqlite3";
import { Database } from "better-sqlite3";

// Open a database connection
const db: Database = new DatabaseConstructor(
  path.resolve(__dirname, "app.sqlite"),
);
console.log("Opened database");

function migrate() {
  const schema: string = fs.readFileSync(
    path.resolve(__dirname, "schema.sql"),
    "utf-8",
  );
  db.exec(schema);
  console.log("Migrated");
}

export { migrate };
