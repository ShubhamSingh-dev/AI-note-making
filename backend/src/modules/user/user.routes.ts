import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "./user.controller.js";
import { validateData } from "../../middleware/validate.middleware.js";
import { loginUserSchema, registerUserSchema } from "../auth/auth.schema.js";
import { verifyJwt } from "../../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(validateData(registerUserSchema), registerUser);
router.route("/login").post(validateData(loginUserSchema), loginUser);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router.route("/logout").get(verifyJwt, logoutUser);

export default router;
