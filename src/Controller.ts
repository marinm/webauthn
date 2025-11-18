import { Request, Response } from "express";
import {
  AuthenticationResponseJSON,
  generateAuthenticationOptions,
  GenerateAuthenticationOptionsOpts,
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
  RegistrationResponseJSON,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
  verifyRegistrationResponse,
  VerifyRegistrationResponseOpts,
  WebAuthnCredential,
} from "@simplewebauthn/server";
import { expectedOrigin, rpID } from "./constants";
import crypto from "crypto";
import { getPasskey, storePasskey } from "./db";

export class Controller {
  options: any;

  constructor(options?: any) {
    this.options = options;
  }

  async getRegistrationChallenge(req: Request, res: Response) {
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

  async register(req: Request, res: Response) {
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

      await storePasskey({
        id: credential.id,
        publicKey: credential.publicKey,
        counter: credential.counter,
        transports: body.response.transports ?? [],
        displayName: "username",
        userId: crypto.randomUUID(),
      });
    }

    delete req.session.currentChallenge;

    res.send({ verified });
  }

  async getAuthenticationChallenge(req: Request, res: Response) {
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

  async authenticate(req: Request, res: Response) {
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
}
