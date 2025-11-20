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
import crypto from "crypto";
import { PasskeyStore } from "./PasskeyStore";
import { WebAuthnOptions } from "./WebAuthnOptions";

const MAX_CHALLENGE_AGE_MS = 60000;

export class Controller {
  options: WebAuthnOptions;
  passkeyStore: PasskeyStore;

  constructor(options: WebAuthnOptions) {
    this.options = options;
    this.passkeyStore = new PasskeyStore(options.databaseFilepath);
  }

  getRegistrationChallenge() {
    return async (req: Request, res: Response) => {
      const opts: GenerateRegistrationOptionsOpts = {
        rpName: "SimpleWebAuthn Example",
        rpID: this.options.rpID,
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

      req.session.webauthnChallenge = options.challenge;
      req.session.webauthnChallengeCreatedAt = new Date();

      res.send(options);
    };
  }

  register() {
    return async (req: Request, res: Response) => {
      const body: RegistrationResponseJSON = req.body;

      const createdAt =
        req.session.webauthnChallengeCreatedAt?.valueOf() ?? Date.now();
      const now = Date.now();
      if (now - createdAt > MAX_CHALLENGE_AGE_MS) {
        res.status(400).send();
      }

      const expectedChallenge = req.session.webauthnChallenge;

      let verification: VerifiedRegistrationResponse;
      try {
        const opts: VerifyRegistrationResponseOpts = {
          response: body,
          expectedChallenge: `${expectedChallenge}`,
          expectedOrigin: this.options.expectedOrigin,
          expectedRPID: this.options.rpID,
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

        const newUserId = crypto.randomUUID();

        await this.passkeyStore.store({
          id: credential.id,
          publicKey: credential.publicKey,
          counter: credential.counter,
          transports: body.response.transports ?? [],
          displayName: "username",
          userId: newUserId,
        });

        req.session.webauthUserId = newUserId;
      }

      req.session.webauthnChallenge = undefined;
      req.session.webauthnChallengeCreatedAt = undefined;

      res.send({ verified });
    };
  }

  getAuthenticationChallenge() {
    return async (req: Request, res: Response) => {
      const opts: GenerateAuthenticationOptionsOpts = {
        timeout: 60000,
        allowCredentials: [],
        userVerification: "preferred",
        rpID: this.options.rpID,
      };

      const options = await generateAuthenticationOptions(opts);

      req.session.webauthnChallenge = options.challenge;
      req.session.webauthnChallengeCreatedAt = new Date();

      res.send(options);
    };
  }

  authenticate() {
    return async (req: Request, res: Response) => {
      const body: AuthenticationResponseJSON = req.body;

      const createdAt =
        req.session.webauthnChallengeCreatedAt?.valueOf() ?? Date.now();
      const now = Date.now();
      if (now - createdAt > MAX_CHALLENGE_AGE_MS) {
        res.status(400).send();
      }

      const expectedChallenge = req.session.webauthnChallenge;

      const passkey = await this.passkeyStore.get(body.id);

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
          expectedOrigin: this.options.expectedOrigin,
          expectedRPID: this.options.rpID,
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
        this.passkeyStore.incrementCounter(passkey.id);
        req.session.webauthUserId = passkey.userId;
      }

      req.session.webauthnChallenge = undefined;
      req.session.webauthnChallengeCreatedAt = undefined;

      res.send({ verified });
    };
  }
}
