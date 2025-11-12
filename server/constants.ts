/**
 * If the server is behind a proxy, the internal host and port are different
 * from the relying party ID and expected origin.
 */
export const host = "localhost";
export const port = 8005;

/**
 * RP ID represents the "scope" of websites on which a credential should be
 * usable. The Origin represents the expected URL from which registration or
 * authentication occurs.
 */
export const rpID = "localhost";
export const expectedOrigin = `http://localhost:${port}`;
