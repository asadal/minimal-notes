
import { db } from '../db';
import { notesTable, noteTagsTable } from '../db/schema';
import { type GetUserNotesInput, type Note } from '../schema';
import { eq, and, isNull, SQL } from 'drizzle-orm';

export const getUserNotes = async (input: GetUserNotesInput): Promise<Note[]> => {
  try {
    const conditions: SQL<unknown>[] = [];

    // Always filter by user_id
    conditions.push(eq(notesTable.user_id, input.user_id));

    // Filter by folder_id if provided
    if (input.folder_id !== undefined) {
      if (input.folder_id === null) {
        conditions.push(isNull(notesTable.folder_id));
      } else {
        conditions.push(eq(notesTable.folder_id, input.folder_id));
      }
    }

    // Handle tag filtering with separate query path
    if (input.tag_id) {
      conditions.push(eq(noteTagsTable.tag_id, input.tag_id));

      const results = await db.select({
        id: notesTable.id,
        title: notesTable.title,
        content: notesTable.content,
        user_id: notesTable.user_id,
        folder_id: notesTable.folder_id,
        created_at: notesTable.created_at,
        updated_at: notesTable.updated_at
      })
        .from(notesTable)
        .innerJoin(noteTagsTable, eq(notesTable.id, noteTagsTable.note_id))
        .where(and(...conditions))
        .execute();

      return results;
    } else {
      // No tag filtering - simple query
      const results = await db.select()
        .from(notesTable)
        .where(and(...conditions))
        .execute();

      return results;
    }
  } catch (error) {
    console.error('Get user notes failed:', error);
    throw error;
  }
};
