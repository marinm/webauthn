/**
 * An example Express server showing off a simple integration of @simplewebauthn/server.
 *
 * The webpages served from ./public use @simplewebauthn/browser.
 */

import http from 'http';
import express from 'express';
import session from 'express-session';
import memoryStore from 'memorystore';
import dotenv from 'dotenv';

dotenv.config();

import {
  AuthenticationResponseJSON,
  VerifiedAuthenticationResponse,
  verifyAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
  WebAuthnCredential,
} from '@simplewebauthn/server';

import { expectedOrigin, host, port, rpID } from './server/constants';
import { inMemoryUserDB, loggedInUserId } from './server/in-memory-user-db';
import { GenerateRegistrationOptionsController } from './server/controllers/GenerateRegistrationOptionsController';
import { VerifyRegistrationController } from './server/controllers/VerifyRegistrationController';
import { GenerateAuthenticationOptionsController } from './server/controllers/GenerateAuthenticationOptions';

const app = express();
const MemoryStore = memoryStore(session);

app.use(express.static('./public/'));
app.use(express.json());
app.use(
  session({
    secret: 'secret123',
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

app.get('/generate-registration-options', GenerateRegistrationOptionsController);

app.post('/verify-registration', VerifyRegistrationController);

app.get('/generate-authentication-options', GenerateAuthenticationOptionsController);

app.post('/verify-authentication', async (req, res) => {
  const body: AuthenticationResponseJSON = req.body;

  const user = inMemoryUserDB[loggedInUserId];

  const expectedChallenge = req.session.currentChallenge;

  let dbCredential: WebAuthnCredential | undefined;
  // "Query the DB" here for a credential matching `cred.id`
  for (const cred of user.credentials) {
    if (cred.id === body.id) {
      dbCredential = cred;
      break;
    }
  }

  if (!dbCredential) {
    return res.status(400).send({
      error: 'Authenticator is not registered with this site',
    });
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    const opts: VerifyAuthenticationResponseOpts = {
      response: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: rpID,
      credential: dbCredential,
      requireUserVerification: false,
    };
    verification = await verifyAuthenticationResponse(opts);
  } catch (error) {
    const _error = error as Error;
    console.error(_error);
    return res.status(400).send({ error: _error.message });
  }

  const { verified, authenticationInfo } = verification;

  if (verified) {
    // Update the credential's counter in the DB to the newest count in the authentication
    dbCredential.counter = authenticationInfo.newCounter;
  }

  req.session.currentChallenge = undefined;

  res.send({ verified });
});

http.createServer(app).listen(port, host, () => {
  console.log(`🚀 Server ready at ${expectedOrigin} (${host}:${port})`);
});
