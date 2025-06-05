
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, notesTable, tagsTable, noteTagsTable } from '../db/schema';
import { getNoteTags } from '../handlers/get_note_tags';

describe('getNoteTags', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return tags for a note', async () => {
    // Create test user
    const user = await db.insert(usersTable)
      .values({
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        google_id: 'google123'
      })
      .returning()
      .execute();

    // Create test note
    const note = await db.insert(notesTable)
      .values({
        id: 'note1',
        title: 'Test Note',
        content: 'Test content',
        user_id: user[0].id
      })
      .returning()
      .execute();

    // Create test tags
    const tags = await db.insert(tagsTable)
      .values([
        {
          id: 'tag1',
          name: 'Important',
          user_id: user[0].id,
          color: '#ff0000'
        },
        {
          id: 'tag2',
          name: 'Work',
          user_id: user[0].id,
          color: '#00ff00'
        }
      ])
      .returning()
      .execute();

    // Associate tags with note
    await db.insert(noteTagsTable)
      .values([
        {
          note_id: note[0].id,
          tag_id: tags[0].id
        },
        {
          note_id: note[0].id,
          tag_id: tags[1].id
        }
      ])
      .execute();

    const result = await getNoteTags(note[0].id);

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('Important');
    expect(result[0].color).toEqual('#ff0000');
    expect(result[0].user_id).toEqual(user[0].id);
    expect(result[1].name).toEqual('Work');
    expect(result[1].color).toEqual('#00ff00');
    expect(result[1].user_id).toEqual(user[0].id);
  });

  it('should return empty array for note with no tags', async () => {
    // Create test user
    const user = await db.insert(usersTable)
      .values({
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        google_id: 'google123'
      })
      .returning()
      .execute();

    // Create test note
    const note = await db.insert(notesTable)
      .values({
        id: 'note1',
        title: 'Test Note',
        content: 'Test content',
        user_id: user[0].id
      })
      .returning()
      .execute();

    const result = await getNoteTags(note[0].id);

    expect(result).toHaveLength(0);
  });

  it('should return empty array for non-existent note', async () => {
    const result = await getNoteTags('non-existent-note');
    expect(result).toHaveLength(0);
  });

  it('should return tags with correct data types', async () => {
    // Create test user
    const user = await db.insert(usersTable)
      .values({
        id: 'user1',
        email: 'test@example.com',
        name: 'Test User',
        google_id: 'google123'
      })
      .returning()
      .execute();

    // Create test note
    const note = await db.insert(notesTable)
      .values({
        id: 'note1',
        title: 'Test Note',
        content: 'Test content',
        user_id: user[0].id
      })
      .returning()
      .execute();

    // Create test tag with null color
    const tag = await db.insert(tagsTable)
      .values({
        id: 'tag1',
        name: 'Test Tag',
        user_id: user[0].id,
        color: null
      })
      .returning()
      .execute();

    // Associate tag with note
    await db.insert(noteTagsTable)
      .values({
        note_id: note[0].id,
        tag_id: tag[0].id
      })
      .execute();

    const result = await getNoteTags(note[0].id);

    expect(result).toHaveLength(1);
    expect(typeof result[0].id).toBe('string');
    expect(typeof result[0].name).toBe('string');
    expect(typeof result[0].user_id).toBe('string');
    expect(result[0].color).toBeNull();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });
});
