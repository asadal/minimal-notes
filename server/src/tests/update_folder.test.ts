
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, foldersTable } from '../db/schema';
import { type CreateUserInput, type CreateFolderInput, type UpdateFolderInput } from '../schema';
import { updateFolder } from '../handlers/update_folder';
import { eq } from 'drizzle-orm';

// Test data
const testUser: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  google_id: 'google_123',
  avatar_url: null
};

const testFolder: CreateFolderInput = {
  name: 'Original Folder',
  user_id: 'user_1',
  parent_folder_id: null
};

const parentFolder: CreateFolderInput = {
  name: 'Parent Folder',
  user_id: 'user_1',
  parent_folder_id: null
};

describe('updateFolder', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update folder name', async () => {
    // Create prerequisite user
    await db.insert(usersTable).values({
      id: 'user_1',
      ...testUser
    }).execute();

    // Create folder to update
    await db.insert(foldersTable).values({
      id: 'folder_1',
      ...testFolder
    }).execute();

    const updateInput: UpdateFolderInput = {
      id: 'folder_1',
      name: 'Updated Folder Name'
    };

    const result = await updateFolder(updateInput);

    expect(result.id).toEqual('folder_1');
    expect(result.name).toEqual('Updated Folder Name');
    expect(result.user_id).toEqual('user_1');
    expect(result.parent_folder_id).toBeNull();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update parent folder', async () => {
    // Create prerequisite user
    await db.insert(usersTable).values({
      id: 'user_1',
      ...testUser
    }).execute();

    // Create parent folder
    await db.insert(foldersTable).values({
      id: 'parent_1',
      ...parentFolder
    }).execute();

    // Create folder to update
    await db.insert(foldersTable).values({
      id: 'folder_1',
      ...testFolder
    }).execute();

    const updateInput: UpdateFolderInput = {
      id: 'folder_1',
      parent_folder_id: 'parent_1'
    };

    const result = await updateFolder(updateInput);

    expect(result.id).toEqual('folder_1');
    expect(result.name).toEqual('Original Folder');
    expect(result.parent_folder_id).toEqual('parent_1');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update multiple fields', async () => {
    // Create prerequisite user
    await db.insert(usersTable).values({
      id: 'user_1',
      ...testUser
    }).execute();

    // Create parent folder
    await db.insert(foldersTable).values({
      id: 'parent_1',
      ...parentFolder
    }).execute();

    // Create folder to update
    await db.insert(foldersTable).values({
      id: 'folder_1',
      ...testFolder
    }).execute();

    const updateInput: UpdateFolderInput = {
      id: 'folder_1',
      name: 'Updated Name',
      parent_folder_id: 'parent_1'
    };

    const result = await updateFolder(updateInput);

    expect(result.id).toEqual('folder_1');
    expect(result.name).toEqual('Updated Name');
    expect(result.parent_folder_id).toEqual('parent_1');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should set parent folder to null', async () => {
    // Create prerequisite user
    await db.insert(usersTable).values({
      id: 'user_1',
      ...testUser
    }).execute();

    // Create parent folder
    await db.insert(foldersTable).values({
      id: 'parent_1',
      ...parentFolder
    }).execute();

    // Create folder with parent
    await db.insert(foldersTable).values({
      id: 'folder_1',
      ...testFolder,
      parent_folder_id: 'parent_1'
    }).execute();

    const updateInput: UpdateFolderInput = {
      id: 'folder_1',
      parent_folder_id: null
    };

    const result = await updateFolder(updateInput);

    expect(result.id).toEqual('folder_1');
    expect(result.parent_folder_id).toBeNull();
  });

  it('should save changes to database', async () => {
    // Create prerequisite user
    await db.insert(usersTable).values({
      id: 'user_1',
      ...testUser
    }).execute();

    // Create folder to update
    await db.insert(foldersTable).values({
      id: 'folder_1',
      ...testFolder
    }).execute();

    const updateInput: UpdateFolderInput = {
      id: 'folder_1',
      name: 'Database Updated Name'
    };

    await updateFolder(updateInput);

    // Verify changes in database
    const folders = await db.select()
      .from(foldersTable)
      .where(eq(foldersTable.id, 'folder_1'))
      .execute();

    expect(folders).toHaveLength(1);
    expect(folders[0].name).toEqual('Database Updated Name');
    expect(folders[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent folder', async () => {
    const updateInput: UpdateFolderInput = {
      id: 'non_existent',
      name: 'New Name'
    };

    expect(updateFolder(updateInput)).rejects.toThrow(/folder not found/i);
  });
});
