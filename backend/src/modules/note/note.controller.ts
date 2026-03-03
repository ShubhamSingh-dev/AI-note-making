import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import * as noteService from "./note.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";


export const createNote = asyncHandler(async (req : Request, res: Response) => {
  const userId = req.user?.id;
  if(!userId) throw new ApiError(401, "Unauthorized");

  const note = await noteService.createNote(userId , req.body);

  res.status(201).json(new ApiResponse(201, note, "Note created successfully"));
})

export const getUserNotes = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const notes = await noteService.getUserNotes(userId);
  res.status(200).json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

export const getNoteById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const noteId = req.params.id as string;

  const note = await noteService.getNoteById(userId, noteId);
  res.status(200).json(new ApiResponse(200, note, "Note fetched successfully"));
});

export const searchNotes = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const query = req.query.q as string;
  if (!query) throw new ApiError(400, "Search query is required");

  const notes = await noteService.searchNotesByContent(userId, query);
  res.status(200).json(new ApiResponse(200, notes, "Notes searched successfully"));
});

export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const noteId = req.params.id as string;
  const note = await noteService.updateNote(userId, noteId, req.body);
  res.status(200).json(new ApiResponse(200, note, "Note updated successfully"));
});

export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const noteId = req.params.id as string;
  await noteService.deleteNote(userId, noteId);
  res.status(200).json(new ApiResponse(200, null, "Note deleted successfully"));
});