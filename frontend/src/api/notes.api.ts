import api from "@/lib/axios";
import type {
  CreateNoteFormData,
  UpdateNoteFormData,
} from "@/schemas/note.schema";

export const createNoteApi = async (data: CreateNoteFormData) => {
  const response = await api.post("/notes", data);
  return response.data;
};

export const getUserNotesApi = async (page = 1, limit = 20) => {
  const response = await api.get("/notes", { params: { page, limit } });
  return response.data;
};

export const getNoteByIdApi = async (id: string) => {
  const response = await api.get(`/notes/${id}`);
  return response.data;
};

export const searchNotesApi = async (query: string) => {
  const response = await api.get("/notes/search", { params: { q: query } });
  return response.data;
};

export const updateNoteApi = async (id: string, data: UpdateNoteFormData) => {
  const response = await api.patch(`/notes/${id}`, data);
  return response.data;
};

export const deleteNoteApi = async (id: string) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};
