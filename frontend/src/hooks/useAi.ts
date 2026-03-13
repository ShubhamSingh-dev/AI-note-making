import { deleteConversationApi, getConversationByIdApi, getConversationsApi, newConversationApi, sendChatMessageApi } from "@/api/ai.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


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
    })
}

export const useGetConversationById = (id: string) => {
  return useQuery({
    queryKey: aiKeys.conversation(id),
    queryFn: () => getConversationByIdApi(id),
    select: (data) => data.data,
    enabled: !!id,
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
    onSuccess: (_, variables) => {
      // Invalidate the active conversation so messages stay in sync
      if (variables.conversationId) {
        queryClient.invalidateQueries({
          queryKey: aiKeys.conversation(variables.conversationId),
        });
      }
      // Refresh conversation list (updatedAt order changes)
      queryClient.invalidateQueries({ queryKey: aiKeys.conversations() });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.conversations() });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: aiKeys.conversations() });
      toast.success("Conversation deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to delete conversation");
    },
  });
};