
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateUserInput = {
  email: 'test@example.com',
  name: 'Test User',
  google_id: 'google123',
  avatar_url: 'https://example.com/avatar.jpg'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user', async () => {
    const result = await createUser(testInput);

    // Basic field validation
    expect(result.email).toEqual('test@example.com');
    expect(result.name).toEqual('Test User');
    expect(result.google_id).toEqual('google123');
    expect(result.avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save user to database', async () => {
    const result = await createUser(testInput);

    // Query using proper drizzle syntax
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].email).toEqual('test@example.com');
    expect(users[0].name).toEqual('Test User');
    expect(users[0].google_id).toEqual('google123');
    expect(users[0].avatar_url).toEqual('https://example.com/avatar.jpg');
    expect(users[0].created_at).toBeInstanceOf(Date);
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle null avatar_url', async () => {
    const inputWithoutAvatar = {
      email: 'test2@example.com',
      name: 'Test User 2',
      google_id: 'google456'
    };

    const result = await createUser(inputWithoutAvatar);

    expect(result.email).toEqual('test2@example.com');
    expect(result.name).toEqual('Test User 2');
    expect(result.google_id).toEqual('google456');
    expect(result.avatar_url).toBeNull();
  });

  it('should enforce unique email constraint', async () => {
    await createUser(testInput);

    const duplicateInput = {
      ...testInput,
      google_id: 'different_google_id'
    };

    await expect(createUser(duplicateInput)).rejects.toThrow();
  });

  it('should enforce unique google_id constraint', async () => {
    await createUser(testInput);

    const duplicateInput = {
      ...testInput,
      email: 'different@example.com'
    };

    await expect(createUser(duplicateInput)).rejects.toThrow();
  });
});
