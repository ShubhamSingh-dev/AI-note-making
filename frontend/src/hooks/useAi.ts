import {
  deleteConversationApi,
  getConversationByIdApi,
  getConversationsApi,
  newConversationApi,
  sendChatMessageApi,
} from "@/api/ai.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { noteKeys } from "./useNotes";

const FIVE_MINUTES = 1000 * 60 * 5;

export const aiKeys = {
  all: ["ai"] as const,
  conversations: () => [...aiKeys.all, "conversations"] as const,
  conversation: (id: string) => [...aiKeys.all, "conversation", id] as const,
};

export const useGetConversations = () => {
  return useQuery({
    queryKey: aiKeys.conversations(),
    queryFn: getConversationsApi,
    select: (data) => data.data,
    staleTime: FIVE_MINUTES,
  });
};

export const useGetConversationById = (id: string) => {
  return useQuery({
    queryKey: aiKeys.conversation(id),
    queryFn: () => getConversationByIdApi(id),
    select: (data) => data.data,
    enabled: !!id,
    staleTime: FIVE_MINUTES,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["sendMessage"],
    mutationFn: ({
      message,
      conversationId,
    }: {
      message: string;
      conversationId?: string;
    }) => sendChatMessageApi(message, conversationId),
    onSuccess: async (_, variables) => {
      // Invalidate the active conversation so messages stay in sync
      if (variables.conversationId) {
        await queryClient.invalidateQueries({
          queryKey: aiKeys.conversation(variables.conversationId),
        });
      }
      // Refresh conversation list (updatedAt order changes)
      await queryClient.invalidateQueries({ queryKey: aiKeys.conversations() });
      await queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to get a response");
    },
  });
};

export const useNewConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["newConversation"],
    mutationFn: newConversationApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: aiKeys.conversations() });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to start new conversation");
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteConversation"],
    mutationFn: (id: string) => deleteConversationApi(id),
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: aiKeys.conversation(id) });
      queryClient.invalidateQueries({ queryKey: aiKeys.conversations() });
      toast.success("Conversation deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to delete conversation");
    },
  });
};
