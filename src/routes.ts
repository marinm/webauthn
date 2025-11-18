import express from "express";

import { generateRegistrationOptionsController } from "./controllers/generateRegistrationOptionsController";
import { verifyRegistrationController } from "./controllers/verifyRegistrationController";
import { generateAuthenticationOptionsController } from "./controllers/generateAuthenticationOptionsController";
import { verifyAuthenticationController } from "./controllers/verifyAuthenticationController";

const router = express.Router();

router.get("/register", generateRegistrationOptionsController);
router.post("/register", verifyRegistrationController);
router.get("/authenticate", generateAuthenticationOptionsController);
router.post("/authenticate", verifyAuthenticationController);

export default router;
