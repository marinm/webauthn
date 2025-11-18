import expressSession from "express-session";
import memoryStore from "memorystore";

declare module "express-session" {
  interface SessionData {
    /**
     * A simple way of storing a user's current challenge being signed by registration or
     * authentication. It should be expired after `timeout` milliseconds (optional argument for
     * `generate` methods, defaults to 60000ms)
     */
    currentChallenge?: string;
  }
}

export default function session() {
  const MemoryStore = memoryStore(expressSession);
  return expressSession({
    secret: "secret123",
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 86400000,
      httpOnly: true, // Ensure to not expose session cookies to clientside scripts
    },
    store: new MemoryStore({
      checkPeriod: 86_400_000, // prune expired entries every 24h
    }),
  });
}
