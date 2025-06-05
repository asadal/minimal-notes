
import { db } from '../db';
import { foldersTable } from '../db/schema';
import { type CreateFolderInput, type Folder } from '../schema';
import { nanoid } from 'nanoid';

export const createFolder = async (input: CreateFolderInput): Promise<Folder> => {
  try {
    // Insert folder record
    const result = await db.insert(foldersTable)
      .values({
        id: nanoid(),
        name: input.name,
        user_id: input.user_id,
        parent_folder_id: input.parent_folder_id || null
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Folder creation failed:', error);
    throw error;
  }
};
