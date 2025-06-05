
import { db } from '../db';
import { notesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type Note } from '../schema';

export const getNoteById = async (noteId: string): Promise<Note | null> => {
  try {
    const results = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, noteId))
      .execute();

    if (results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Get note by ID failed:', error);
    throw error;
  }
};
