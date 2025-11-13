import { LoggedInUser } from "./example-server";

declare global {
    namespace Express {
        interface Request {
            user: LoggedInUser;
        }
    }
}
