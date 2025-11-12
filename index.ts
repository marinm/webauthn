/**
 * An example Express server showing off a simple integration of @simplewebauthn/server.
 *
 * The webpages served from ./public use @simplewebauthn/browser.
 */

import express from "express";
import session from "express-session";
import memoryStore from "memorystore";
import dotenv from "dotenv";

dotenv.config();

import { host, port } from "./server/constants";
import { GenerateRegistrationOptionsController } from "./server/controllers/GenerateRegistrationOptionsController";
import { VerifyRegistrationController } from "./server/controllers/VerifyRegistrationController";
import { GenerateAuthenticationOptionsController } from "./server/controllers/GenerateAuthenticationOptions";
import { VerifyAuthenticationController } from "./server/controllers/VerifyAuthenticationController";

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
    })
);

app.get(
    "/generate-registration-options",
    GenerateRegistrationOptionsController
);

app.post("/verify-registration", VerifyRegistrationController);

app.get(
    "/generate-authentication-options",
    GenerateAuthenticationOptionsController
);

app.post("/verify-authentication", VerifyAuthenticationController);

app.listen(port, host, () => console.log(`🚀 Server ready at ${host}:${port}`));
