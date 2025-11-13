import { inMemoryUserDB, loggedInUserId } from "./in-memory-user-db";

export function setRequestUser(req: any, res: any, next: any) {
	req.user = inMemoryUserDB[loggedInUserId];
	next();
}
