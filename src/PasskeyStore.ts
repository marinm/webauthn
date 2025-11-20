import DatabaseConstructor, { Database } from "better-sqlite3";
import { AuthenticatorTransportFuture } from "@simplewebauthn/server";

type PasskeyRow = {
  id: string;
  public_key: Uint8Array;
  counter: number;
  transports: string;
  display_name: string;
  user_id: string;
};

export type Passkey = {
  id: string;
  publicKey: Uint8Array;
  counter: number;
  transports: AuthenticatorTransportFuture[];
  displayName: string;
  userId: string;
};

export class PasskeyStore {
  #database: Database;

  constructor(filepath: string) {
    this.#database = new DatabaseConstructor(filepath);

    this.#database.exec(`
      CREATE TABLE IF NOT EXISTS passkeys (
        id TEXT PRIMARY KEY,
        public_key BLOB NOT NULL,
        counter INT NOT NULL,
        transports TEXT,
        display_name TEXT NOT NULL,
        user_id TEXT NOT NULL
      );
    `);
  }

  async get(id: string): Promise<Passkey | undefined> {
    const row = await this.#database
      .prepare<string, PasskeyRow>(`SELECT * FROM passkeys WHERE id = ?`)
      .get(id);

    if (!row) {
      return undefined;
    }

    return {
      id: row.id,
      publicKey: row.public_key,
      counter: row.counter,
      transports: JSON.parse(row.transports),
      displayName: row.display_name,
      userId: row.user_id,
    };
  }

  async store(passkey: Passkey): Promise<void> {
    const row: PasskeyRow = {
      id: passkey.id,
      public_key: passkey.publicKey,
      counter: passkey.counter,
      transports: JSON.stringify(passkey.transports),
      display_name: passkey.displayName,
      user_id: passkey.userId,
    };

    const statement = `
		INSERT INTO
			passkeys (
				id,
				public_key,
				counter,
				transports,
				display_name,
				user_id
			)
		VALUES (
			@id,
			@public_key,
			@counter,
			@transports,
			@display_name,
			@user_id
		);
	`;

    await this.#database.prepare(statement).run(row);
  }

  async incrementCounter(id: string): Promise<void> {
    await this.#database
      .prepare("UPDATE passkeys SET counter = counter + 1 WHERE id = ?")
      .run([id]);
  }
}
