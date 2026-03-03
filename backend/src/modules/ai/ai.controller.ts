import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { runAgent } from "./ai.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { message } = req.body;

  if (!message) throw new ApiError(400, "Message is required");

  const response = await runAgent(userId, message);

  res
    .status(200)
    .json(new ApiResponse(200, { response }, "Agent responded successfully"));
});
