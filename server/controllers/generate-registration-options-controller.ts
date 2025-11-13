import { Request, Response } from "express";
import {
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
  WebAuthnCredential,
} from "@simplewebauthn/server";
import { rpID } from "../constants";

export async function GenerateRegistrationOptionsController(
  req: Request,
  res: Response,
) {
  const user = req.user;

  const {
    /**
     * The username can be a human-readable name, email, etc... as it is intended only for display.
     */
    username,
    credentials,
  } = user;

  const opts: GenerateRegistrationOptionsOpts = {
    rpName: "SimpleWebAuthn Example",
    rpID,
    userName: username,
    timeout: 60000,
    attestationType: "none",
    /**
     * Passing in a user's list of already-registered credential IDs here prevents users from
     * registering the same authenticator multiple times. The authenticator will simply throw an
     * error in the browser if it's asked to perform registration when it recognizes one of the
     * credential ID's.
     */
    excludeCredentials: credentials.map((cred: WebAuthnCredential) => ({
      id: cred.id,
      type: "public-key",
      transports: cred.transports,
    })),
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
