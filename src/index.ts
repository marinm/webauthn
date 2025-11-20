import express from "express";
import routes from "./routes";
import session from "./session";

/**
 * If the server is behind a proxy, the internal host and port are different
 * from the relying party ID and expected origin.
 */
const host = "localhost";
const port = 8005;

/**
 * RP ID represents the "scope" of websites on which a credential should be
 * usable. The Origin represents the expected URL from which registration or
 * authentication occurs.
 */
const rpID = "localhost";
const expectedOrigin = `http://${host}:${port}`;

/**
 * A standalone SQLite database is created with a passkeys table. The parent
 * folder should already exist. The file itself will be created if it doesn't
 * already exist, but the server process should have read and write access to
 * it.
 */
const databaseFilepath = "./passkeys.sqlite";

const app = express();

app.use(session());
app.use(
  routes({
    rpID,
    expectedOrigin,
    databaseFilepath,
  }),
);

app.listen(port, host, () =>
  console.log(`🚀 Server ready at ${expectedOrigin}`),
);
