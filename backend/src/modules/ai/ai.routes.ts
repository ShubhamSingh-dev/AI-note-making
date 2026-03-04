import { Router } from "express";
import { validateData } from "../../middleware/validate.middleware.js";
import {
  chat,
  deleteConversation,
  getConversationById,
  getConversations,
  newConversation,
} from "./ai.controller.js";
import { verifyJwt } from "../../middleware/auth.middleware.js";
import { chatSchema } from "./ai.schema.js";

const router = Router();

router.use(verifyJwt);

//chat
router.route("/chat").post(validateData(chatSchema), chat);

//conversations management
router.route("/conversations").get(getConversations).post(newConversation);
router
  .route("/conversations/:id")
  .get(getConversationById)
  .delete(deleteConversation);

export default router;
