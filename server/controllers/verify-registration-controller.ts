import crypto from "crypto";
import { Request, Response } from "express";
import {
  RegistrationResponseJSON,
  VerifiedRegistrationResponse,
  verifyRegistrationResponse,
  VerifyRegistrationResponseOpts,
} from "@simplewebauthn/server";
import { expectedOrigin, rpID } from "../constants";
import db from "../db";
import { passkeys } from "../db/schema/passkeys";

export async function VerifyRegistrationController(
  req: Request,
  res: Response,
) {
  const body: RegistrationResponseJSON = req.body;

  const expectedChallenge = req.session.currentChallenge;

  let verification: VerifiedRegistrationResponse;
  try {
    const opts: VerifyRegistrationResponseOpts = {
      response: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: false,
    };
    verification = await verifyRegistrationResponse(opts);
  } catch (error) {
    const _error = error as Error;
    console.error(_error);
    return res.status(400).send({ error: _error.message });
  }

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { credential } = registrationInfo;

    await db.insert(passkeys).values({
      id: credential.id,
      publicKey: credential.publicKey,
      counter: credential.counter,
      transports: body.response.transports,
      displayName: "username",
      userId: crypto.randomUUID(),
    });
  }

  delete req.session.currentChallenge;

  res.send({ verified });
}
