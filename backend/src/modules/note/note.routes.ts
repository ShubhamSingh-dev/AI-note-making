import { Router } from "express";
import { verifyJwt } from "../../middleware/auth.middleware.js";
import { validateData } from "../../middleware/validate.middleware.js";
import { createNoteSchema, updateNoteSchema } from "./note.schema.js";
import {
  createNote,
  deleteNote,
  getNoteById,
  getUserNotes,
  searchNotes,
  updateNote,
} from "./note.controller.js";

const router = Router();

// all note routes are protected
router.use(verifyJwt);

router.route("/").get(getUserNotes).post(validateData(createNoteSchema), createNote);
router.route("/search").get(searchNotes);
router.route("/:id").get(getNoteById).patch(validateData(updateNoteSchema), updateNote).delete(deleteNote);

export default router;