import expressSession from "express-session";
import memoryStore from "memorystore";

declare module "express-session" {
  interface SessionData {
    webauthnChallenge?: string;
    webauthnChallengeCreatedAt?: Date;
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
