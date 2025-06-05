
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, notesTable, tagsTable, noteTagsTable } from '../db/schema';
import { type RemoveTagFromNoteInput } from '../schema';
import { removeTagFromNote } from '../handlers/remove_tag_from_note';
import { and, eq } from 'drizzle-orm';

describe('removeTagFromNote', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should remove tag from note', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
      google_id: 'google123'
    }).execute();

    await db.insert(notesTable).values({
      id: 'note1',
      title: 'Test Note',
      content: 'Test content',
      user_id: 'user1'
    }).execute();

    await db.insert(tagsTable).values({
      id: 'tag1',
      name: 'Test Tag',
      user_id: 'user1'
    }).execute();

    // Create note-tag relationship
    await db.insert(noteTagsTable).values({
      note_id: 'note1',
      tag_id: 'tag1'
    }).execute();

    const input: RemoveTagFromNoteInput = {
      note_id: 'note1',
      tag_id: 'tag1'
    };

    await removeTagFromNote(input);

    // Verify relationship was removed
    const noteTags = await db.select()
      .from(noteTagsTable)
      .where(
        and(
          eq(noteTagsTable.note_id, 'note1'),
          eq(noteTagsTable.tag_id, 'tag1')
        )
      )
      .execute();

    expect(noteTags).toHaveLength(0);
  });

  it('should not error when removing non-existent tag relationship', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
      google_id: 'google123'
    }).execute();

    await db.insert(notesTable).values({
      id: 'note1',
      title: 'Test Note',
      content: 'Test content',
      user_id: 'user1'
    }).execute();

    await db.insert(tagsTable).values({
      id: 'tag1',
      name: 'Test Tag',
      user_id: 'user1'
    }).execute();

    const input: RemoveTagFromNoteInput = {
      note_id: 'note1',
      tag_id: 'tag1'
    };

    // Should not throw error even if relationship doesn't exist
    await expect(removeTagFromNote(input)).resolves.toBeUndefined();
  });

  it('should only remove specified tag relationship', async () => {
    // Create prerequisite data
    await db.insert(usersTable).values({
      id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
      google_id: 'google123'
    }).execute();

    await db.insert(notesTable).values({
      id: 'note1',
      title: 'Test Note',
      content: 'Test content',
      user_id: 'user1'
    }).execute();

    await db.insert(tagsTable).values([
      {
        id: 'tag1',
        name: 'Test Tag 1',
        user_id: 'user1'
      },
      {
        id: 'tag2',
        name: 'Test Tag 2',
        user_id: 'user1'
      }
    ]).execute();

    // Create multiple note-tag relationships
    await db.insert(noteTagsTable).values([
      {
        note_id: 'note1',
        tag_id: 'tag1'
      },
      {
        note_id: 'note1',
        tag_id: 'tag2'
      }
    ]).execute();

    const input: RemoveTagFromNoteInput = {
      note_id: 'note1',
      tag_id: 'tag1'
    };

    await removeTagFromNote(input);

    // Verify only tag1 relationship was removed
    const tag1Relationship = await db.select()
      .from(noteTagsTable)
      .where(
        and(
          eq(noteTagsTable.note_id, 'note1'),
          eq(noteTagsTable.tag_id, 'tag1')
        )
      )
      .execute();

    const tag2Relationship = await db.select()
      .from(noteTagsTable)
      .where(
        and(
          eq(noteTagsTable.note_id, 'note1'),
          eq(noteTagsTable.tag_id, 'tag2')
        )
      )
      .execute();

    expect(tag1Relationship).toHaveLength(0);
    expect(tag2Relationship).toHaveLength(1);
  });
});
