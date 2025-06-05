
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { foldersTable, usersTable, notesTable } from '../db/schema';
import { type CreateUserInput, type CreateFolderInput, type CreateNoteInput } from '../schema';
import { deleteFolder } from '../handlers/delete_folder';
import { eq } from 'drizzle-orm';

const testUser: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  google_id: 'google123'
};

const testFolder: CreateFolderInput = {
  name: 'Test Folder',
  user_id: 'user1'
};

const testNote: CreateNoteInput = {
  title: 'Test Note',
  content: 'Test content',
  user_id: 'user1',
  folder_id: 'folder1'
};

describe('deleteFolder', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a folder', async () => {
    // Create user first
    await db.insert(usersTable)
      .values({
        id: 'user1',
        email: testUser.email,
        name: testUser.name,
        google_id: testUser.google_id,
        avatar_url: testUser.avatar_url || null,
        created_at: new Date(),
        updated_at: new Date()
      })
      .execute();

    // Create folder
    await db.insert(foldersTable)
      .values({
        id: 'folder1',
        name: testFolder.name,
        user_id: testFolder.user_id,
        parent_folder_id: testFolder.parent_folder_id || null,
        created_at: new Date(),
        updated_at: new Date()
      })
      .execute();

    // Delete folder
    await deleteFolder('folder1');

    // Verify folder is deleted
    const folders = await db.select()
      .from(foldersTable)
      .where(eq(foldersTable.id, 'folder1'))
      .execute();

    expect(folders).toHaveLength(0);
  });

  it('should handle deleting non-existent folder', async () => {
    // Should not throw error when deleting non-existent folder
    await expect(async () => {
      await deleteFolder('non-existent');
    }).not.toThrow();
  });

  it('should delete parent folder (subfolders will have dangling references)', async () => {
    // Create user first
    await db.insert(usersTable)
      .values({
        id: 'user1',
        email: testUser.email,
        name: testUser.name,
        google_id: testUser.google_id,
        avatar_url: testUser.avatar_url || null,
        created_at: new Date(),
        updated_at: new Date()
      })
      .execute();

    // Create parent folder
    await db.insert(foldersTable)
      .values({
        id: 'folder1',
        name: testFolder.name,
        user_id: testFolder.user_id,
        parent_folder_id: null,
        created_at: new Date(),
        updated_at: new Date()
      })
      .execute();

    // Create child folder
    await db.insert(foldersTable)
      .values({
        id: 'folder2',
        name: 'Child Folder',
        user_id: testFolder.user_id,
        parent_folder_id: 'folder1',
        created_at: new Date(),
        updated_at: new Date()
      })
      .execute();

    // Delete parent folder
    await deleteFolder('folder1');

    // Verify parent folder is deleted
    const parentFolders = await db.select()
      .from(foldersTable)
      .where(eq(foldersTable.id, 'folder1'))
      .execute();

    // Child folder should still exist but with dangling parent reference
    const childFolders = await db.select()
      .from(foldersTable)
      .where(eq(foldersTable.id, 'folder2'))
      .execute();

    expect(parentFolders).toHaveLength(0);
    expect(childFolders).toHaveLength(1);
    expect(childFolders[0].parent_folder_id).toBe('folder1'); // Dangling reference
  });

  it('should set notes folder_id to null when folder is deleted', async () => {
    // Create user first
    await db.insert(usersTable)
      .values({
        id: 'user1',
        email: testUser.email,
        name: testUser.name,
        google_id: testUser.google_id,
        avatar_url: testUser.avatar_url || null,
        created_at: new Date(),
        updated_at: new Date()
      })
      .execute();

    // Create folder
    await db.insert(foldersTable)
      .values({
        id: 'folder1',
        name: testFolder.name,
        user_id: testFolder.user_id,
        parent_folder_id: null,
        created_at: new Date(),
        updated_at: new Date()
      })
      .execute();

    // Create note in folder
    await db.insert(notesTable)
      .values({
        id: 'note1',
        title: testNote.title,
        content: testNote.content,
        user_id: testNote.user_id,
        folder_id: 'folder1',
        created_at: new Date(),
        updated_at: new Date()
      })
      .execute();

    // Delete folder
    await deleteFolder('folder1');

    // Verify note still exists but folder_id is set to null
    const notes = await db.select()
      .from(notesTable)
      .where(eq(notesTable.id, 'note1'))
      .execute();

    expect(notes).toHaveLength(1);
    expect(notes[0].folder_id).toBeNull();
  });
});
