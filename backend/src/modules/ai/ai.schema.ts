import { z } from "zod";

export const chatSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").trim(),
  conversationId: z.uuid("Invalid conversation ID").optional(),
});
