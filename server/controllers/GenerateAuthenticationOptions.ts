import {
    generateAuthenticationOptions,
    GenerateAuthenticationOptionsOpts,
} from "@simplewebauthn/server";
import { rpID } from "../constants";
import { inMemoryUserDB, loggedInUserId } from "../in-memory-user-db";

export async function GenerateAuthenticationOptionsController(
    req: any,
    res: any
) {
    // You need to know the user by this point
    const user = inMemoryUserDB[loggedInUserId];

    const opts: GenerateAuthenticationOptionsOpts = {
        timeout: 60000,
        allowCredentials: user.credentials.map((cred) => ({
            id: cred.id,
            type: "public-key",
            transports: cred.transports,
        })),
        /**
         * Wondering why user verification isn't required? See here:
         *
         * https://passkeys.dev/docs/use-cases/bootstrapping/#a-note-about-user-verification
         */
        userVerification: "preferred",
        rpID,
    };

    const options = await generateAuthenticationOptions(opts);

    /**
     * The server needs to temporarily remember this value for verification, so don't lose it until
     * after you verify the authentication response.
     */
    req.session.currentChallenge = options.challenge;

    res.send(options);
}
