
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Sidebar } from '@/components/Sidebar';
import { NoteEditor } from '@/components/NoteEditor';
import { NoteList } from '@/components/NoteList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon, UserIcon } from 'lucide-react';
import type { Note, Folder, Tag, User } from '../../server/src/schema';

function App() {
  // Default user - in production this would come from Google OAuth
  const [user] = useState<User>({
    id: 'user-1',
    email: 'user@example.com',
    name: 'John Doe',
    google_id: 'google-123',
    avatar_url: null,
    created_at: new Date(),
    updated_at: new Date()
  });

  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load user data
  const loadNotes = useCallback(async () => {
    try {
      const result = await trpc.getUserNotes.query({
        user_id: user.id,
        folder_id: selectedFolder || undefined,
        tag_id: selectedTag || undefined
      });
      setNotes(result);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, [user.id, selectedFolder, selectedTag]);

  const loadFolders = useCallback(async () => {
    try {
      const result = await trpc.getUserFolders.query(user.id);
      setFolders(result);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  }, [user.id]);

  const loadTags = useCallback(async () => {
    try {
      const result = await trpc.getUserTags.query(user.id);
      setTags(result);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  }, [user.id]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleCreateNote = async () => {
    setIsLoading(true);
    try {
      const newNote = await trpc.createNote.mutate({
        title: 'Untitled Note',
        content: '',
        user_id: user.id,
        folder_id: selectedFolder || undefined
      });
      setNotes((prev: Note[]) => [newNote, ...prev]);
      setSelectedNote(newNote);
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteUpdate = async (updatedNote: Note) => {
    setNotes((prev: Note[]) =>
      prev.map((note: Note) => note.id === updatedNote.id ? updatedNote : note)
    );
    setSelectedNote(updatedNote);
  };

  const handleNoteDelete = async (noteId: string) => {
    try {
      await trpc.deleteNote.mutate(noteId);
      setNotes((prev: Note[]) => prev.filter((note: Note) => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const filteredNotes = notes.filter((note: Note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        folders={folders}
        tags={tags}
        selectedFolder={selectedFolder}
        selectedTag={selectedTag}
        onFolderSelect={setSelectedFolder}
        onTagSelect={setSelectedTag}
        onFolderCreate={loadFolders}
        onTagCreate={loadTags}
        userId={user.id}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Notes List */}
        <div className="w-80 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-2 flex-1">
                <UserIcon className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">{user.name}</span>
              </div>
              <Button
                onClick={handleCreateNote}
                disabled={isLoading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <NoteList
            notes={filteredNotes}
            selectedNote={selectedNote}
            onNoteSelect={setSelectedNote}
            onNoteDelete={handleNoteDelete}
          />
        </div>

        {/* Note Editor */}
        <div className="flex-1">
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              folders={folders}
              tags={tags}
              onNoteUpdate={handleNoteUpdate}
              userId={user.id}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📝</div>
                <h2 className="text-xl font-medium mb-2">Select a note to start writing</h2>
                <p className="text-gray-400">Choose a note from the sidebar or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
