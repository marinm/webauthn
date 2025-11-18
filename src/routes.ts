import express from "express";

import { getRegistrationChallenge } from "./handlers/getRegistrationChallenge";
import { register } from "./handlers/register";
import { getAuthenticationChallenge } from "./handlers/getAuthenticationChallenge";
import { authenticate } from "./handlers/authenticate";

const router = express.Router();

router.use(express.json());

router.get("/register", getRegistrationChallenge);
router.post("/register", register);
router.get("/authenticate", getAuthenticationChallenge);
router.post("/authenticate", authenticate);

export default router;
