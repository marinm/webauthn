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

import { host, port } from "./constants";
import { generateRegistrationOptionsController } from "./controllers/generateRegistrationOptionsController";
import { verifyRegistrationController } from "./controllers/verifyRegistrationController";
import { generateAuthenticationOptionsController } from "./controllers/generateAuthenticationOptionsController";
import { verifyAuthenticationController } from "./controllers/verifyAuthenticationController";

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

app.get(
  "/generate-registration-options",
  generateRegistrationOptionsController,
);

app.post("/verify-registration", verifyRegistrationController);

app.get(
  "/generate-authentication-options",
  generateAuthenticationOptionsController,
);

app.post("/verify-authentication", verifyAuthenticationController);

app.listen(port, host, () => console.log(`🚀 Server ready at ${host}:${port}`));
