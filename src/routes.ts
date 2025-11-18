import express from "express";

import { Controller } from "./Controller";

export default function (options?: any) {
  const router = express.Router();

  router.use(express.json());

  const controller = new Controller(options);

  router.get("/register", controller.getRegistrationChallenge());
  router.post("/register", controller.register());
  router.get("/authenticate", controller.getAuthenticationChallenge());
  router.post("/authenticate", controller.authenticate());

  return router;
}
