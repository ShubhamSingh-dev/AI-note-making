import {
  createNoteApi,
  deleteNoteApi,
  getNoteByIdApi,
  getUserNotesApi,
  searchNotesApi,
  updateNoteApi,
} from "@/api/notes.api";
import type {
  CreateNoteFormData,
  UpdateNoteFormData,
} from "@/schemas/note.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const FIVE_MINUTES = 1000 * 60 * 5;

export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  list: (page: number, limit: number) =>
    [...noteKeys.lists(), { page, limit }] as const,
  detail: (id: string) => [...noteKeys.all, "detail", id] as const,
  search: (query: string) => [...noteKeys.all, "search", query] as const,
};

export const useGetNotes = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: noteKeys.list(page, limit),
    queryFn: () => getUserNotesApi(page, limit),
    select: (data) => data.data,
    staleTime: FIVE_MINUTES,
    placeholderData: (previousData: any) => previousData,
  });
};

export const useGetNoteById = (id: string) => {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => getNoteByIdApi(id),
    select: (data) => data.data,
    enabled: !!id,
    staleTime: FIVE_MINUTES,
  });
};

export const useSearchNotes = (query: string) => {
  return useQuery({
    queryKey: noteKeys.search(query),
    queryFn: () => searchNotesApi(query),
    select: (data) => data.data,
    enabled: !!query.trim(),
    staleTime: FIVE_MINUTES,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createNote"],
    mutationFn: (data: CreateNoteFormData) => createNoteApi(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      toast.success("Note created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to create note");
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateNote"],
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteFormData }) =>
      updateNoteApi(id, data),
    onSuccess: async (response) => {
      const updateNote = response.data;
      queryClient.setQueryData(noteKeys.detail(updateNote.id), response.data);
      await queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      toast.success("Note updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update note");
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteNote"],
    mutationFn: (id: string) => deleteNoteApi(id),
    onSuccess: async (_, id) => {
      // Remove the note from cache immediately
      queryClient.removeQueries({ queryKey: noteKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      toast.success("Note deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to delete note");
    },
  });
};
