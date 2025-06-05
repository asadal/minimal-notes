
import { db } from '../db';
import { tagsTable } from '../db/schema';
import { type Tag } from '../schema';
import { eq } from 'drizzle-orm';

export const getUserTags = async (userId: string): Promise<Tag[]> => {
  try {
    const results = await db.select()
      .from(tagsTable)
      .where(eq(tagsTable.user_id, userId))
      .execute();

    return results;
  } catch (error) {
    console.error('Get user tags failed:', error);
    throw error;
  }
};
