import express from "express";

import { generateRegistrationOptionsController } from "./controllers/generateRegistrationOptionsController";
import { verifyRegistrationController } from "./controllers/verifyRegistrationController";
import { generateAuthenticationOptionsController } from "./controllers/generateAuthenticationOptionsController";
import { verifyAuthenticationController } from "./controllers/verifyAuthenticationController";

const router = express.Router();

router.get(
  "/generate-registration-options",
  generateRegistrationOptionsController,
);

router.post("/verify-registration", verifyRegistrationController);

router.get(
  "/generate-authentication-options",
  generateAuthenticationOptionsController,
);

router.post("/verify-authentication", verifyAuthenticationController);

export default router;
