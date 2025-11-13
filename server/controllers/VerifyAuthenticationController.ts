import { Request, Response } from 'express';
import {
    AuthenticationResponseJSON,
    VerifiedAuthenticationResponse,
    verifyAuthenticationResponse,
    VerifyAuthenticationResponseOpts,
    WebAuthnCredential,
} from "@simplewebauthn/server";
import { expectedOrigin, rpID } from "../constants";

export async function VerifyAuthenticationController(req: Request, res: Response) {
    const body: AuthenticationResponseJSON = req.body;

    const user = req.user;

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
            error: "Authenticator is not registered with this site",
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
        // Update the credential's counter in the DB to the newest count in the
        // authentication
        dbCredential.counter = authenticationInfo.newCounter;
    }

    req.session.currentChallenge = undefined;

    res.send({ verified });
}
