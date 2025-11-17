import { Request, Response } from "express";
import {
  generateAuthenticationOptions,
  GenerateAuthenticationOptionsOpts,
  WebAuthnCredential,
} from "@simplewebauthn/server";
import { rpID } from "../constants";

export async function generateAuthenticationOptionsController(
  req: Request,
  res: Response,
) {
  const opts: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: [],
    userVerification: "preferred",
    rpID,
  };

  const options = await generateAuthenticationOptions(opts);

  req.session.currentChallenge = options.challenge;

  res.send(options);
}
