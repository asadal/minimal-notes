
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createUserInputSchema,
  createFolderInputSchema,
  updateFolderInputSchema,
  createNoteInputSchema,
  updateNoteInputSchema,
  getUserNotesInputSchema,
  createTagInputSchema,
  updateTagInputSchema,
  addTagToNoteInputSchema,
  removeTagFromNoteInputSchema,
  createAttachmentInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { getUserByGoogleId } from './handlers/get_user_by_google_id';
import { createFolder } from './handlers/create_folder';
import { getUserFolders } from './handlers/get_user_folders';
import { updateFolder } from './handlers/update_folder';
import { deleteFolder } from './handlers/delete_folder';
import { createNote } from './handlers/create_note';
import { getUserNotes } from './handlers/get_user_notes';
import { getNoteById } from './handlers/get_note_by_id';
import { updateNote } from './handlers/update_note';
import { deleteNote } from './handlers/delete_note';
import { createTag } from './handlers/create_tag';
import { getUserTags } from './handlers/get_user_tags';
import { updateTag } from './handlers/update_tag';
import { deleteTag } from './handlers/delete_tag';
import { addTagToNote } from './handlers/add_tag_to_note';
import { removeTagFromNote } from './handlers/remove_tag_from_note';
import { getNoteTags } from './handlers/get_note_tags';
import { createAttachment } from './handlers/create_attachment';
import { getNoteAttachments } from './handlers/get_note_attachments';
import { deleteAttachment } from './handlers/delete_attachment';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User routes
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),

  getUserByGoogleId: publicProcedure
    .input(z.string())
    .query(({ input }) => getUserByGoogleId(input)),

  // Folder routes
  createFolder: publicProcedure
    .input(createFolderInputSchema)
    .mutation(({ input }) => createFolder(input)),

  getUserFolders: publicProcedure
    .input(z.string())
    .query(({ input }) => getUserFolders(input)),

  updateFolder: publicProcedure
    .input(updateFolderInputSchema)
    .mutation(({ input }) => updateFolder(input)),

  deleteFolder: publicProcedure
    .input(z.string())
    .mutation(({ input }) => deleteFolder(input)),

  // Note routes
  createNote: publicProcedure
    .input(createNoteInputSchema)
    .mutation(({ input }) => createNote(input)),

  getUserNotes: publicProcedure
    .input(getUserNotesInputSchema)
    .query(({ input }) => getUserNotes(input)),

  getNoteById: publicProcedure
    .input(z.string())
    .query(({ input }) => getNoteById(input)),

  updateNote: publicProcedure
    .input(updateNoteInputSchema)
    .mutation(({ input }) => updateNote(input)),

  deleteNote: publicProcedure
    .input(z.string())
    .mutation(({ input }) => deleteNote(input)),

  // Tag routes
  createTag: publicProcedure
    .input(createTagInputSchema)
    .mutation(({ input }) => createTag(input)),

  getUserTags: publicProcedure
    .input(z.string())
    .query(({ input }) => getUserTags(input)),

  updateTag: publicProcedure
    .input(updateTagInputSchema)
    .mutation(({ input }) => updateTag(input)),

  deleteTag: publicProcedure
    .input(z.string())
    .mutation(({ input }) => deleteTag(input)),

  // Note-Tag relations
  addTagToNote: publicProcedure
    .input(addTagToNoteInputSchema)
    .mutation(({ input }) => addTagToNote(input)),

  removeTagFromNote: publicProcedure
    .input(removeTagFromNoteInputSchema)
    .mutation(({ input }) => removeTagFromNote(input)),

  getNoteTags: publicProcedure
    .input(z.string())
    .query(({ input }) => getNoteTags(input)),

  // Attachment routes
  createAttachment: publicProcedure
    .input(createAttachmentInputSchema)
    .mutation(({ input }) => createAttachment(input)),

  getNoteAttachments: publicProcedure
    .input(z.string())
    .query(({ input }) => getNoteAttachments(input)),

  deleteAttachment: publicProcedure
    .input(z.string())
    .mutation(({ input }) => deleteAttachment(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
