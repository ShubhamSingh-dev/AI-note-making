import * as noteService from "../note/note.service.js";
import Groq from "groq-sdk";

type Tool = Groq.Chat.ChatCompletionTool;

// Tool definitions — Groq follows OpenAI format
export const tools: Tool[] = [
  {
    type: "function",
    function: {
      name: "create_note",
      description: "Creates a new note for the user with a title and content",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title of the note" },
          content: { type: "string", description: "Content of the note" },
        },
        required: ["title", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_note",
      description:
        "Updates an existing note. Only provide fields that need to change.",
      parameters: {
        type: "object",
        properties: {
          noteId: { type: "string", description: "ID of the note to update" },
          title: { type: "string", description: "New title" },
          content: { type: "string", description: "New content" },
          isCompleted: {
            type: "boolean",
            description: "Mark note as completed or not",
          },
        },
        required: ["noteId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_note",
      description: "Permanently deletes a note by its ID",
      parameters: {
        type: "object",
        properties: {
          noteId: { type: "string", description: "ID of the note to delete" },
        },
        required: ["noteId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_note_by_id",
      description: "Fetches a single note by its ID",
      parameters: {
        type: "object",
        properties: {
          noteId: { type: "string", description: "ID of the note to fetch" },
        },
        required: ["noteId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_all_notes",
      description: "Retrieves all notes for the user",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_notes",
      description: "Searches notes by title or content using a text query",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search term to look for in notes",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "summarize_note",
      description:
        "Returns a concise AI-generated summary of a note's content. Use when the user asks to summarize or get a quick overview of a note.",
      parameters: {
        type: "object",
        properties: {
          noteId: {
            type: "string",
            description: "ID of the note to summarize",
          },
        },
        required: ["noteId"],
      },
    },
  },
];

// Executes whichever tool the AI decided to call
export const executeTool = async (
  toolName: string,
  toolInput: Record<string, unknown>,
  userId: string
): Promise<unknown> => {
  switch (toolName) {
    case "create_note":
      return await noteService.createNote(userId, {
        title: toolInput.title as string,
        content: toolInput.content as string,
      });

    case "update_note": {
      const { noteId, ...updateData } = toolInput;
      return await noteService.updateNote(userId, noteId as string, updateData);
    }

    case "delete_note":
      return await noteService.deleteNote(userId, toolInput.noteId as string);

    case "get_note_by_id":
      return await noteService.getNoteById(userId, toolInput.noteId as string);

    case "get_all_notes":
      return await noteService.getUserNotes(userId);

    case "search_notes":
      return await noteService.searchNotesByContent(
        userId,
        toolInput.query as string
      );
    case "summarize_note":
      return await noteService.summarizeNote(userId, toolInput.noteId as string);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
};
