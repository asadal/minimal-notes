
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, foldersTable } from '../db/schema';
import { getUserFolders } from '../handlers/get_user_folders';

describe('getUserFolders', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return folders for a user', async () => {
    // Create test user
    const userId = 'user-1';
    await db.insert(usersTable).values({
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      google_id: 'google-123'
    });

    // Create test folders
    await db.insert(foldersTable).values([
      {
        id: 'folder-1',
        name: 'Work',
        user_id: userId,
        parent_folder_id: null
      },
      {
        id: 'folder-2',
        name: 'Personal',
        user_id: userId,
        parent_folder_id: null
      },
      {
        id: 'folder-3',
        name: 'Projects',
        user_id: userId,
        parent_folder_id: 'folder-1'
      }
    ]);

    const result = await getUserFolders(userId);

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('Work');
    expect(result[0].user_id).toEqual(userId);
    expect(result[0].parent_folder_id).toBeNull();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    expect(result[1].name).toEqual('Personal');
    expect(result[2].name).toEqual('Projects');
    expect(result[2].parent_folder_id).toEqual('folder-1');
  });

  it('should return empty array for user with no folders', async () => {
    // Create test user
    const userId = 'user-2';
    await db.insert(usersTable).values({
      id: userId,
      email: 'test2@example.com',
      name: 'Test User 2',
      google_id: 'google-456'
    });

    const result = await getUserFolders(userId);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should only return folders for the specified user', async () => {
    // Create two test users
    const userId1 = 'user-1';
    const userId2 = 'user-2';
    
    await db.insert(usersTable).values([
      {
        id: userId1,
        email: 'test1@example.com',
        name: 'Test User 1',
        google_id: 'google-123'
      },
      {
        id: userId2,
        email: 'test2@example.com',
        name: 'Test User 2',
        google_id: 'google-456'
      }
    ]);

    // Create folders for both users
    await db.insert(foldersTable).values([
      {
        id: 'folder-1',
        name: 'User 1 Folder',
        user_id: userId1,
        parent_folder_id: null
      },
      {
        id: 'folder-2',
        name: 'User 2 Folder',
        user_id: userId2,
        parent_folder_id: null
      }
    ]);

    const result = await getUserFolders(userId1);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('User 1 Folder');
    expect(result[0].user_id).toEqual(userId1);
  });
});
