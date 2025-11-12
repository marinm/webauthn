import {
    WebAuthnCredential,
    RegistrationResponseJSON,
    VerifiedRegistrationResponse,
    verifyRegistrationResponse,
    VerifyRegistrationResponseOpts,
} from "@simplewebauthn/server";
import { expectedOrigin, rpID } from "../constants";
import { inMemoryUserDB, loggedInUserId } from "../in-memory-user-db";

export async function VerifyRegistrationController(req: any, res: any) {
    const body: RegistrationResponseJSON = req.body;

    const user = inMemoryUserDB[loggedInUserId];

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

        const existingCredential = user.credentials.find(
            (cred) => cred.id === credential.id
        );

        if (!existingCredential) {
            /**
             * Add the returned credential to the user's list of credentials
             */
            const newCredential: WebAuthnCredential = {
                id: credential.id,
                publicKey: credential.publicKey,
                counter: credential.counter,
                transports: body.response.transports,
            };
            user.credentials.push(newCredential);
        }
    }

    req.session.currentChallenge = undefined;

    res.send({ verified });
}
