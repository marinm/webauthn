/**
 * An example Express server showing off a simple integration of @simplewebauthn/server.
 *
 * The webpages served from ./public use @simplewebauthn/browser.
 */

import dotenv from "dotenv";

dotenv.config();

import express from "express";
import session from "express-session";
import memoryStore from "memorystore";

import "express-session";

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

import routes from "./routes";
import { host, port } from "./constants";

const app = express();
const MemoryStore = memoryStore(session);

app.use(express.static("./public/"));
app.use(express.json());
app.use(
  session({
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
  }),
);

app.use(routes);

app.listen(port, host, () => console.log(`🚀 Server ready at ${host}:${port}`));
