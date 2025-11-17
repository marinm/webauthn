import { animals } from "../usernames/animals";
import { personalityTraits } from "../usernames/personalityTraits";
import { uniqueUsernameGenerator } from "unique-username-generator";

export function createUsername(): string {
  return uniqueUsernameGenerator({
    dictionaries: [personalityTraits, animals],
    separator: "-",
    style: "kebabCase",
    randomDigits: 0,
  });
}
