import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { runAgent } from "./ai.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { prisma } from "../../config/prisma.js";

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { message , conversationId} = req.body;

  if (!message) throw new ApiError(400, "Message is required");

  const response = await runAgent(userId, message,conversationId);

  res
    .status(200)
    .json(new ApiResponse(200, { response }, "Agent responded successfully"));
});

// Returns all conversations for the current user (most recent first)
export const getConversations = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 1, //just get the most recent message
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          conversations,
          "Conversations fetched successfully"
        )
      );
  }
);

// Returns all messages in a specific conversation
export const getConversationById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conversation) throw new ApiError(404, "Conversation not found");
    if (conversation.userId !== userId) throw new ApiError(403, "Forbidden");

    res
      .status(200)
      .json(
        new ApiResponse(200, conversation, "Conversation fetched successfully")
      );
  }
);

// Deletes a conversation and all its messages (cascade handled by DB)
export const deleteConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) throw new ApiError(404, "Conversation not found");
    if (conversation.userId !== userId) throw new ApiError(403, "Forbidden");

    await prisma.conversation.delete({ where: { id } });

    res
      .status(200)
      .json(new ApiResponse(200, null, "Conversation deleted successfully"));
  }
);

// Starts a brand new conversation (clears context for the AI)
export const newConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const conversation = await prisma.conversation.create({
      data: { userId },
      include: { messages: true },
    });

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          conversation,
          "New conversation created successfully"
        )
      );
  }
);
