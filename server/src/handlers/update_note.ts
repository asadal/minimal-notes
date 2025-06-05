
import { db } from '../db';
import { notesTable } from '../db/schema';
import { type UpdateNoteInput, type Note } from '../schema';
import { eq } from 'drizzle-orm';

export const updateNote = async (input: UpdateNoteInput): Promise<Note> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<{
      title: string;
      content: string;
      folder_id: string | null;
      updated_at: Date;
    }> = {
      updated_at: new Date()
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.content !== undefined) {
      updateData.content = input.content;
    }

    if (input.folder_id !== undefined) {
      updateData.folder_id = input.folder_id;
    }

    // Update the note
    const result = await db.update(notesTable)
      .set(updateData)
      .where(eq(notesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Note with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Note update failed:', error);
    throw error;
  }
};
