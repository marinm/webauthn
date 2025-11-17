import { Request, Response, NextFunction } from "express";
import "./request";

export function setRequestUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.userId = null;
  next();
}
