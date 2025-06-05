
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type User } from '../schema';
import { randomUUID } from 'crypto';

export const createUser = async (input: CreateUserInput): Promise<User> => {
  try {
    // Insert user record
    const result = await db.insert(usersTable)
      .values({
        id: randomUUID(),
        email: input.email,
        name: input.name,
        google_id: input.google_id,
        avatar_url: input.avatar_url || null
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('User creation failed:', error);
    throw error;
  }
};
