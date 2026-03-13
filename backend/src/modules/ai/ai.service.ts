// ai.service.ts
import Groq from "groq-sdk";
import { groq } from "../../config/groq.js";
import { prisma } from "../../config/prisma.js";
import { tools, executeTool } from "./ai.tools.js";
import { MessageRole } from "@prisma/client";

type Message = Groq.Chat.ChatCompletionMessageParam;

export const runAgent = async (
  userId: string,
  userMessage: string,
  conversationId?: string
) => {
  // 1. Get specific conversation if ID provided, otherwise get most recent, or create new
  let conversation;

  if (conversationId) {
    conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conversation) throw new Error("Conversation not found or access denied");
  } else {
    conversation = await prisma.conversation.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { userId },
      include: { messages: true },
    });
  }

  // 2. Build message history from DB BEFORE saving the new user message.
  //    This prevents the new user message from appearing twice in the context.
  const messages: Message[] = [
    {
      role: "system",
      content: `You are a helpful AI note-taking assistant.
      You help users create, update, delete, search, and retrieve their notes.
      Always use the provided tools to perform actions on notes.
      Never make up note IDs — only use IDs returned from previous tool calls.
      When the user's request is ambiguous, ask for clarification.
      Be concise and friendly.`,
    },
    ...conversation.messages.map((msg) => {
      if (msg.role === MessageRole.tool) {
        return {
          role: "tool" as const,
          tool_call_id: msg.toolCallId ?? "restored",
          content: msg.content,
        };
      }
      if (msg.role === MessageRole.assistant) {
        try {
          const parsed = JSON.parse(msg.content);
          if (parsed.tool_calls) {
            return {
              role: "assistant" as const,
              content: null,
              tool_calls: parsed.tool_calls,
            };
          }
        } catch {}
        return { role: "assistant" as const, content: msg.content };
      }
      return { role: "user" as const, content: msg.content };
    }),
    // 3. Append the new user message ONCE at the end
    { role: "user" as const, content: userMessage },
  ];

  // 4. NOW save the user message to DB (after building the context above)
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: MessageRole.user,
      content: userMessage,
    },
  });

  // 5. Agent loop
  const MAX_TURNS = 10;
  let turn = 0;

  while (turn < MAX_TURNS) {
    turn++;

    // FIX 2: Wrap Groq call to handle model generating malformed tool calls
    let response;
    try {
      response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        tools,
        tool_choice: "auto",
      });
    } catch (err: unknown) {
      const isMalformedToolCall =
        err instanceof Error && err.message.includes("tool_use_failed");

      const errorMsg = isMalformedToolCall
        ? "Sorry, I had trouble calling that tool. Could you rephrase your request?"
        : "An error occurred. Please try again.";

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: MessageRole.assistant,
          content: errorMsg,
        },
      });

      return errorMsg;
    }

    const choice = response.choices[0];
    const assistantMessage = choice.message;
    const finishReason = choice.finish_reason;

    messages.push(assistantMessage);

    // AI is done — save final response and return
    if (finishReason === "stop") {
      const finalResponse = assistantMessage.content ?? "Done.";

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: MessageRole.assistant,
          content: finalResponse,
        },
      });

      return finalResponse;
    }

    // AI wants to call tools
    if (finishReason === "tool_calls" && assistantMessage.tool_calls) {
      // Save assistant tool_calls message to DB
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: MessageRole.assistant,
          content: JSON.stringify({ tool_calls: assistantMessage.tool_calls }),
        },
      });

      for (const toolCall of assistantMessage.tool_calls) {
        let toolResultStr: string;

        try {
          const toolResult = await executeTool(
            toolCall.function.name,
            JSON.parse(toolCall.function.arguments) as Record<string, unknown>,
            userId
          );

          // FIX 1: deleteNote returns void → JSON.stringify(undefined) = undefined
          // Prisma rejects a missing content field, so always fallback to { success: true }
          toolResultStr =
            toolResult !== undefined && toolResult !== null
              ? JSON.stringify(toolResult)
              : JSON.stringify({ success: true });

        } catch (err) {
          // Surface tool execution errors back to the model instead of crashing
          toolResultStr = JSON.stringify({
            error:
              err instanceof Error ? err.message : "Tool execution failed",
          });
        }

        // Save tool result to DB with toolCallId for history restoration
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            role: MessageRole.tool,
            content: toolResultStr,
            toolCallId: toolCall.id,
          },
        });

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolResultStr,
        });
      }
    }
  }

  throw new Error("Agent exceeded maximum number of turns");
};