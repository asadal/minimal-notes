
import { db } from '../db';
import { tagsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteTag = async (tagId: string): Promise<void> => {
  try {
    await db.delete(tagsTable)
      .where(eq(tagsTable.id, tagId))
      .execute();
  } catch (error) {
    console.error('Tag deletion failed:', error);
    throw error;
  }
};
