
import { db } from '../db';
import { noteTagsTable, tagsTable } from '../db/schema';
import { type Tag } from '../schema';
import { eq } from 'drizzle-orm';

export const getNoteTags = async (noteId: string): Promise<Tag[]> => {
  try {
    const results = await db.select({
      id: tagsTable.id,
      name: tagsTable.name,
      user_id: tagsTable.user_id,
      color: tagsTable.color,
      created_at: tagsTable.created_at
    })
    .from(noteTagsTable)
    .innerJoin(tagsTable, eq(noteTagsTable.tag_id, tagsTable.id))
    .where(eq(noteTagsTable.note_id, noteId))
    .execute();

    return results.map(result => ({
      id: result.id,
      name: result.name,
      user_id: result.user_id,
      color: result.color,
      created_at: result.created_at
    }));
  } catch (error) {
    console.error('Get note tags failed:', error);
    throw error;
  }
};
