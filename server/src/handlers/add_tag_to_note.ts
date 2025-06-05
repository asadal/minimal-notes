
import { db } from '../db';
import { noteTagsTable, notesTable, tagsTable } from '../db/schema';
import { type AddTagToNoteInput, type NoteTag } from '../schema';
import { eq, and } from 'drizzle-orm';

export const addTagToNote = async (input: AddTagToNoteInput): Promise<NoteTag> => {
  try {
    // Verify note exists
    const note = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, input.note_id))
      .execute();

    if (note.length === 0) {
      throw new Error('Note not found');
    }

    // Verify tag exists
    const tag = await db.select()
      .from(tagsTable)
      .where(eq(tagsTable.id, input.tag_id))
      .execute();

    if (tag.length === 0) {
      throw new Error('Tag not found');
    }

    // Check if tag is already associated with note
    const existing = await db.select()
      .from(noteTagsTable)
      .where(and(
        eq(noteTagsTable.note_id, input.note_id),
        eq(noteTagsTable.tag_id, input.tag_id)
      ))
      .execute();

    if (existing.length > 0) {
      // Return existing association
      return existing[0];
    }

    // Create new note-tag association
    const result = await db.insert(noteTagsTable)
      .values({
        note_id: input.note_id,
        tag_id: input.tag_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Add tag to note failed:', error);
    throw error;
  }
};
