import { Router } from "express";
import { validateData } from "../../middleware/validate.middleware.js";
import { chat } from "./ai.controller.js";
import { verifyJwt } from "../../middleware/auth.middleware.js";
import { chatSchema } from "./ai.schema.js";

const router = Router();

router.use(verifyJwt);

router.route("/chat").post(validateData(chatSchema), chat);

export default router;
