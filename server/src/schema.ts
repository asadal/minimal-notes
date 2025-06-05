
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  google_id: z.string(),
  avatar_url: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Folder schema
export const folderSchema = z.object({
  id: z.string(),
  name: z.string(),
  user_id: z.string(),
  parent_folder_id: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Folder = z.infer<typeof folderSchema>;

// Note schema
export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  user_id: z.string(),
  folder_id: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Note = z.infer<typeof noteSchema>;

// Tag schema
export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  user_id: z.string(),
  color: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Tag = z.infer<typeof tagSchema>;

// Note-Tag relation schema
export const noteTagSchema = z.object({
  note_id: z.string(),
  tag_id: z.string(),
  created_at: z.coerce.date()
});

export type NoteTag = z.infer<typeof noteTagSchema>;

// Attachment schema
export const attachmentSchema = z.object({
  id: z.string(),
  note_id: z.string(),
  filename: z.string(),
  original_filename: z.string(),
  file_size: z.number().int(),
  mime_type: z.string(),
  file_path: z.string(),
  created_at: z.coerce.date()
});

export type Attachment = z.infer<typeof attachmentSchema>;

// Input schemas for creating entities
export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  google_id: z.string(),
  avatar_url: z.string().nullable().optional()
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createFolderInputSchema = z.object({
  name: z.string().min(1),
  user_id: z.string(),
  parent_folder_id: z.string().nullable().optional()
});

export type CreateFolderInput = z.infer<typeof createFolderInputSchema>;

export const createNoteInputSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  user_id: z.string(),
  folder_id: z.string().nullable().optional()
});

export type CreateNoteInput = z.infer<typeof createNoteInputSchema>;

export const createTagInputSchema = z.object({
  name: z.string().min(1),
  user_id: z.string(),
  color: z.string().nullable().optional()
});

export type CreateTagInput = z.infer<typeof createTagInputSchema>;

export const createAttachmentInputSchema = z.object({
  note_id: z.string(),
  filename: z.string(),
  original_filename: z.string(),
  file_size: z.number().int().positive(),
  mime_type: z.string(),
  file_path: z.string()
});

export type CreateAttachmentInput = z.infer<typeof createAttachmentInputSchema>;

// Update schemas
export const updateNoteInputSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  folder_id: z.string().nullable().optional()
});

export type UpdateNoteInput = z.infer<typeof updateNoteInputSchema>;

export const updateFolderInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  parent_folder_id: z.string().nullable().optional()
});

export type UpdateFolderInput = z.infer<typeof updateFolderInputSchema>;

export const updateTagInputSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  color: z.string().nullable().optional()
});

export type UpdateTagInput = z.infer<typeof updateTagInputSchema>;

// Query schemas
export const getUserNotesInputSchema = z.object({
  user_id: z.string(),
  folder_id: z.string().nullable().optional(),
  tag_id: z.string().optional()
});

export type GetUserNotesInput = z.infer<typeof getUserNotesInputSchema>;

export const addTagToNoteInputSchema = z.object({
  note_id: z.string(),
  tag_id: z.string()
});

export type AddTagToNoteInput = z.infer<typeof addTagToNoteInputSchema>;

export const removeTagFromNoteInputSchema = z.object({
  note_id: z.string(),
  tag_id: z.string()
});

export type RemoveTagFromNoteInput = z.infer<typeof removeTagFromNoteInputSchema>;
