
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type CreateNoteInput, type Note } from '../schema';

export const createNote = async (input: CreateNoteInput): Promise<Note> => {
  try {
    const result = await db.insert(notesTable)
      .values({
        id: crypto.randomUUID(),
        title: input.title,
        content: input.content,
        user_id: input.user_id,
        folder_id: input.folder_id ?? null
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Note creation failed:', error);
    throw error;
  }
};
