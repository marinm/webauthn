import { LoggedInUser } from "./session";

declare global {
  namespace Express {
    interface Request {
      userId: string | null;
    }
  }
}
