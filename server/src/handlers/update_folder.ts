
import { db } from '../db';
import { foldersTable } from '../db/schema';
import { type UpdateFolderInput, type Folder } from '../schema';
import { eq } from 'drizzle-orm';

export const updateFolder = async (input: UpdateFolderInput): Promise<Folder> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<{
      name: string;
      parent_folder_id: string | null;
      updated_at: Date;
    }> = {
      updated_at: new Date()
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.parent_folder_id !== undefined) {
      updateData.parent_folder_id = input.parent_folder_id;
    }

    // Update folder record
    const result = await db.update(foldersTable)
      .set(updateData)
      .where(eq(foldersTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Folder not found');
    }

    return result[0];
  } catch (error) {
    console.error('Folder update failed:', error);
    throw error;
  }
};
