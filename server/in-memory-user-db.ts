import { LoggedInUser } from "./example-server";
import { animals } from "./usernames/animals";
import { personalityTraits } from "./usernames/personality-traits";
import { uniqueUsernameGenerator } from "unique-username-generator";

/**
 * 2FA and Passwordless WebAuthn flows expect you to be able to uniquely
 * identify the user that performs registration or authentication. The user ID
 * you specify here should be your internal, _unique_ ID for that user (uuid,
 * etc...). Avoid using identifying information here, like email addresses, as
 * it may be stored within the credential.
 *
 * Here, the example server assumes the following user has completed login:
 */
export const loggedInUserId = "internalUserId";

const username = uniqueUsernameGenerator({
  dictionaries: [personalityTraits, animals],
  separator: "-",
  style: "kebabCase",
  randomDigits: 0,
});

export const inMemoryUserDB: { [loggedInUserId: string]: LoggedInUser } = {
  [loggedInUserId]: {
    id: loggedInUserId,
    username: username,
    credentials: [],
  },
};
