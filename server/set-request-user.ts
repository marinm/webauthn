import { Request, Response, NextFunction } from "express";
import { inMemoryUserDB, loggedInUserId } from "./in-memory-user-db";
import "./request";

export function setRequestUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.user = inMemoryUserDB[loggedInUserId];
  next();
}
