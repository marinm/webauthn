export type WebAuthnOptions = {
  /**
   * RP ID represents the "scope" of websites on which a credential should be
   * usable. The Origin represents the expected URL from which registration or
   * authentication occurs.
   */
  rpID: string;

  /**
   * If the server is behind a proxy, the internal host and port are different
   * from the relying party ID and expected origin.
   */
  expectedOrigin: string;

  /**
   * A standalone SQLite database is created with a passkeys table. The parent
   * folder should already exist. The file itself will be created if it doesn't
   * already exist, but the server process should have read and write access to
   * it.
   */
  databaseFilepath: string;
};
