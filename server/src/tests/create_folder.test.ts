
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { foldersTable, usersTable } from '../db/schema';
import { type CreateFolderInput } from '../schema';
import { createFolder } from '../handlers/create_folder';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

describe('createFolder', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a folder', async () => {
    // Create prerequisite user
    const userId = nanoid();
    await db.insert(usersTable)
      .values({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        google_id: 'google123'
      })
      .execute();

    const testInput: CreateFolderInput = {
      name: 'Test Folder',
      user_id: userId,
      parent_folder_id: null
    };

    const result = await createFolder(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Folder');
    expect(result.user_id).toEqual(userId);
    expect(result.parent_folder_id).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save folder to database', async () => {
    // Create prerequisite user
    const userId = nanoid();
    await db.insert(usersTable)
      .values({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        google_id: 'google123'
      })
      .execute();

    const testInput: CreateFolderInput = {
      name: 'Test Folder',
      user_id: userId,
      parent_folder_id: null
    };

    const result = await createFolder(testInput);

    // Query using proper drizzle syntax
    const folders = await db.select()
      .from(foldersTable)
      .where(eq(foldersTable.id, result.id))
      .execute();

    expect(folders).toHaveLength(1);
    expect(folders[0].name).toEqual('Test Folder');
    expect(folders[0].user_id).toEqual(userId);
    expect(folders[0].parent_folder_id).toBeNull();
    expect(folders[0].created_at).toBeInstanceOf(Date);
    expect(folders[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create folder with parent folder', async () => {
    // Create prerequisite user
    const userId = nanoid();
    await db.insert(usersTable)
      .values({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        google_id: 'google123'
      })
      .execute();

    // Create parent folder
    const parentFolderId = nanoid();
    await db.insert(foldersTable)
      .values({
        id: parentFolderId,
        name: 'Parent Folder',
        user_id: userId,
        parent_folder_id: null
      })
      .execute();

    const testInput: CreateFolderInput = {
      name: 'Subfolder',
      user_id: userId,
      parent_folder_id: parentFolderId
    };

    const result = await createFolder(testInput);

    expect(result.name).toEqual('Subfolder');
    expect(result.user_id).toEqual(userId);
    expect(result.parent_folder_id).toEqual(parentFolderId);

    // Verify in database
    const folders = await db.select()
      .from(foldersTable)
      .where(eq(foldersTable.id, result.id))
      .execute();

    expect(folders[0].parent_folder_id).toEqual(parentFolderId);
  });

  it('should throw error for invalid user_id', async () => {
    const testInput: CreateFolderInput = {
      name: 'Test Folder',
      user_id: 'invalid-user-id',
      parent_folder_id: null
    };

    await expect(createFolder(testInput)).rejects.toThrow(/violates foreign key constraint|foreign key/i);
  });

  it('should create folder with invalid parent_folder_id', async () => {
    // Create prerequisite user
    const userId = nanoid();
    await db.insert(usersTable)
      .values({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        google_id: 'google123'
      })
      .execute();

    const testInput: CreateFolderInput = {
      name: 'Test Folder',
      user_id: userId,
      parent_folder_id: 'invalid-parent-id'
    };

    // This should succeed because parent_folder_id doesn't have a foreign key constraint
    const result = await createFolder(testInput);

    expect(result.name).toEqual('Test Folder');
    expect(result.user_id).toEqual(userId);
    expect(result.parent_folder_id).toEqual('invalid-parent-id');
  });
});
