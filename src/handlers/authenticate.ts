import { Request, Response } from "express";
import {
  AuthenticationResponseJSON,
  VerifiedAuthenticationResponse,
  verifyAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
  WebAuthnCredential,
} from "@simplewebauthn/server";
import { expectedOrigin, rpID } from "../constants";
import { getPasskey } from "../db";

export async function authenticate(req: Request, res: Response) {
  const body: AuthenticationResponseJSON = req.body;

  const expectedChallenge = req.session.currentChallenge;

  const passkey = await getPasskey(body.id);

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
    dbCredential.counter = authenticationInfo.newCounter;
  }

  req.session.currentChallenge = undefined;

  res.send({ verified });
}
