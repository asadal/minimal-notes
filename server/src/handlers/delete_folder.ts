
import { db } from '../db';
import { foldersTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteFolder = async (folderId: string): Promise<void> => {
  try {
    await db.delete(foldersTable)
      .where(eq(foldersTable.id, folderId))
      .execute();
  } catch (error) {
    console.error('Folder deletion failed:', error);
    throw error;
  }
};
