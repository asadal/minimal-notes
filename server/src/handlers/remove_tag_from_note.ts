
import { db } from '../db';
import { noteTagsTable } from '../db/schema';
import { type RemoveTagFromNoteInput } from '../schema';
import { and, eq } from 'drizzle-orm';

export const removeTagFromNote = async (input: RemoveTagFromNoteInput): Promise<void> => {
  try {
    await db.delete(noteTagsTable)
      .where(
        and(
          eq(noteTagsTable.note_id, input.note_id),
          eq(noteTagsTable.tag_id, input.tag_id)
        )
      )
      .execute();
  } catch (error) {
    console.error('Remove tag from note failed:', error);
    throw error;
  }
};
