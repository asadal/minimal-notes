
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, tagsTable, notesTable, noteTagsTable } from '../db/schema';
import { deleteTag } from '../handlers/delete_tag';
import { eq } from 'drizzle-orm';

describe('deleteTag', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a tag', async () => {
    // Create a user first
    await db.insert(usersTable).values({
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
      google_id: 'google123'
    }).execute();

    // Create a tag
    await db.insert(tagsTable).values({
      id: 'tag1',
      name: 'Test Tag',
      user_id: 'user1',
      color: '#ff0000'
    }).execute();

    // Delete the tag
    await deleteTag('tag1');

    // Verify tag is deleted
    const tags = await db.select()
      .from(tagsTable)
      .where(eq(tagsTable.id, 'tag1'))
      .execute();

    expect(tags).toHaveLength(0);
  });

  it('should delete tag associations when tag is deleted', async () => {
    // Create a user first
    await db.insert(usersTable).values({
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
      google_id: 'google123'
    }).execute();

    // Create a tag
    await db.insert(tagsTable).values({
      id: 'tag1',
      name: 'Test Tag',
      user_id: 'user1',
      color: '#ff0000'
    }).execute();

    // Create a note
    await db.insert(notesTable).values({
      id: 'note1',
      title: 'Test Note',
      content: 'Test content',
      user_id: 'user1'
    }).execute();

    // Create note-tag association
    await db.insert(noteTagsTable).values({
      note_id: 'note1',
      tag_id: 'tag1'
    }).execute();

    // Delete the tag
    await deleteTag('tag1');

    // Verify tag is deleted
    const tags = await db.select()
      .from(tagsTable)
      .where(eq(tagsTable.id, 'tag1'))
      .execute();

    expect(tags).toHaveLength(0);

    // Verify note-tag association is also deleted (cascade delete)
    const noteTags = await db.select()
      .from(noteTagsTable)
      .where(eq(noteTagsTable.tag_id, 'tag1'))
      .execute();

    expect(noteTags).toHaveLength(0);
  });

  it('should handle deleting non-existent tag', async () => {
    // This should not throw an error - DELETE on non-existent records is safe
    await expect(deleteTag('non-existent-tag')).resolves.toBeUndefined();
  });
});
