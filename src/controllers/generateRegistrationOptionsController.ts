import { Request, Response } from "express";
import {
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
} from "@simplewebauthn/server";
import { rpID } from "../constants";

export async function generateRegistrationOptionsController(
  req: Request,
  res: Response,
) {
  const opts: GenerateRegistrationOptionsOpts = {
    rpName: "SimpleWebAuthn Example",
    rpID,
    userName: "username",
    timeout: 60000,
    attestationType: "none",
    excludeCredentials: [],
    authenticatorSelection: {
      residentKey: "discouraged",
      /**
       * Wondering why user verification isn't required? See here:
       *
       * https://passkeys.dev/docs/use-cases/bootstrapping/#a-note-about-user-verification
       */
      userVerification: "preferred",
    },
    /**
     * Support the two most common algorithms: ES256, and RS256
     */
    supportedAlgorithmIDs: [-7, -257],
  };

  const options = await generateRegistrationOptions(opts);

  /**
   * The server needs to temporarily remember this value for verification, so don't lose it until
   * after you verify the registration response.
   */
  req.session.currentChallenge = options.challenge;

  res.send(options);
}
