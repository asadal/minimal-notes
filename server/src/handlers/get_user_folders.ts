
import { db } from '../db';
import { foldersTable } from '../db/schema';
import { type Folder } from '../schema';
import { eq } from 'drizzle-orm';

export const getUserFolders = async (userId: string): Promise<Folder[]> => {
  try {
    const folders = await db.select()
      .from(foldersTable)
      .where(eq(foldersTable.user_id, userId))
      .execute();

    return folders;
  } catch (error) {
    console.error('Get user folders failed:', error);
    throw error;
  }
};
