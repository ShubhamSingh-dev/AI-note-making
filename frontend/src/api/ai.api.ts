import api from "@/lib/axios";

export const sendChatMessageApi = async (message: string, conversationId?:string) => {
    const response = await api.post("ai/chat", {message, conversationId});
    return response.data;
}

export const getConversationsApi = async () => {
    const response = await api.get("ai/conversations");
    return response.data;
}

export const getConversationByIdApi = async (id: string) => {
    const response = await api.get(`ai/conversations/${id}`);
    return response.data;
}

export const newConversationApi = async () => {
    const response = await api.post("ai/conversations");
    return response.data;
}

export const deleteConversationApi = async (id: string) => {
    const response = await api.delete(`ai/conversations/${id}`);
    return response.data;
}