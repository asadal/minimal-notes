
import { db } from '../db';
import { tagsTable } from '../db/schema';
import { type CreateTagInput, type Tag } from '../schema';
import { randomUUID } from 'crypto';

export const createTag = async (input: CreateTagInput): Promise<Tag> => {
  try {
    // Insert tag record
    const result = await db.insert(tagsTable)
      .values({
        id: randomUUID(),
        name: input.name,
        user_id: input.user_id,
        color: input.color ?? null
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Tag creation failed:', error);
    throw error;
  }
};
