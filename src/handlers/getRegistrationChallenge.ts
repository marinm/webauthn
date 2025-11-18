import { Request, Response } from "express";
import {
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
} from "@simplewebauthn/server";
import { rpID } from "../constants";

export async function getRegistrationChallenge(req: Request, res: Response) {
  const opts: GenerateRegistrationOptionsOpts = {
    rpName: "SimpleWebAuthn Example",
    rpID,
    userName: "username",
    timeout: 60000,
    attestationType: "none",
    excludeCredentials: [],
    authenticatorSelection: {
      residentKey: "discouraged",
      userVerification: "preferred",
    },
    supportedAlgorithmIDs: [-7, -257],
  };

  const options = await generateRegistrationOptions(opts);

  req.session.currentChallenge = options.challenge;

  res.send(options);
}
