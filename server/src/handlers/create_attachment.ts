
import { db } from '../db';
import { attachmentsTable } from '../db/schema';
import { type CreateAttachmentInput, type Attachment } from '../schema';

export const createAttachment = async (input: CreateAttachmentInput): Promise<Attachment> => {
  try {
    const result = await db.insert(attachmentsTable)
      .values({
        id: crypto.randomUUID(),
        note_id: input.note_id,
        filename: input.filename,
        original_filename: input.original_filename,
        file_size: input.file_size,
        mime_type: input.mime_type,
        file_path: input.file_path
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Attachment creation failed:', error);
    throw error;
  }
};
