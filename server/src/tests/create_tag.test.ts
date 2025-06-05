
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, tagsTable } from '../db/schema';
import { type CreateTagInput } from '../schema';
import { createTag } from '../handlers/create_tag';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// Test user data
const testUserId = randomUUID();
const testUser = {
  id: testUserId,
  email: 'test@example.com',
  name: 'Test User',
  google_id: 'google123'
};

// Simple test input
const testInput: CreateTagInput = {
  name: 'Important',
  user_id: testUserId,
  color: '#ff0000'
};

describe('createTag', () => {
  beforeEach(async () => {
    await createDB();
    // Create test user first
    await db.insert(usersTable).values(testUser).execute();
  });
  
  afterEach(resetDB);

  it('should create a tag', async () => {
    const result = await createTag(testInput);

    // Basic field validation
    expect(result.name).toEqual('Important');
    expect(result.user_id).toEqual(testUserId);
    expect(result.color).toEqual('#ff0000');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save tag to database', async () => {
    const result = await createTag(testInput);

    // Query using proper drizzle syntax
    const tags = await db.select()
      .from(tagsTable)
      .where(eq(tagsTable.id, result.id))
      .execute();

    expect(tags).toHaveLength(1);
    expect(tags[0].name).toEqual('Important');
    expect(tags[0].user_id).toEqual(testUserId);
    expect(tags[0].color).toEqual('#ff0000');
    expect(tags[0].created_at).toBeInstanceOf(Date);
  });

  it('should create tag without color', async () => {
    const inputWithoutColor: CreateTagInput = {
      name: 'No Color Tag',
      user_id: testUserId
    };

    const result = await createTag(inputWithoutColor);

    expect(result.name).toEqual('No Color Tag');
    expect(result.user_id).toEqual(testUserId);
    expect(result.color).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent user', async () => {
    const invalidInput: CreateTagInput = {
      name: 'Invalid User Tag',
      user_id: randomUUID() // Non-existent user ID
    };

    await expect(createTag(invalidInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
