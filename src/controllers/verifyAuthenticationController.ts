import { Request, Response } from "express";
import {
  AuthenticationResponseJSON,
  VerifiedAuthenticationResponse,
  verifyAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
  WebAuthnCredential,
} from "@simplewebauthn/server";
import { expectedOrigin, rpID } from "../constants";
import { passkeys } from "../db/schema/passkeys";
import { eq } from "drizzle-orm";
import db from "../db";

export async function verifyAuthenticationController(
  req: Request,
  res: Response,
) {
  const body: AuthenticationResponseJSON = req.body;

  const expectedChallenge = req.session.currentChallenge;

  const results = await db
    .select()
    .from(passkeys)
    .where(eq(passkeys.id, body.id))
    .limit(1);

  const passkey = results[0] ?? null;

  if (!passkey) {
    return res.status(400).send({
      error: "Authenticator is not registered with this site",
    });
  }

  let dbCredential: WebAuthnCredential = {
    id: passkey.id,
    publicKey: Uint8Array.from(passkey.publicKey),
    counter: passkey.counter,
    transports: passkey.transports ?? undefined,
  };

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
    // Update the credential's counter in the DB to the newest count in the
    // authentication
    dbCredential.counter = authenticationInfo.newCounter;
  }

  req.session.currentChallenge = undefined;

  res.send({ verified });
}
