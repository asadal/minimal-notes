
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { AttachmentManager } from '@/components/AttachmentManager';
import { TagManager } from '@/components/TagManager';
import { SaveIcon, FolderIcon, TagIcon } from 'lucide-react';
import type { Note, Folder, Tag, Attachment } from '../../../server/src/schema';

interface NoteEditorProps {
  note: Note;
  folders: Folder[];
  tags: Tag[];
  onNoteUpdate: (note: Note) => void;
  userId: string;
}

export function NoteEditor({ note, folders, tags, onNoteUpdate }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [selectedFolder, setSelectedFolder] = useState<string>(note.folder_id || 'none');
  const [noteTags, setNoteTags] = useState<Tag[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load note tags and attachments
  const loadNoteTags = useCallback(async () => {
    try {
      const result = await trpc.getNoteTags.query(note.id);
      setNoteTags(result);
    } catch (error) {
      console.error('Failed to load note tags:', error);
    }
  }, [note.id]);

  const loadAttachments = useCallback(async () => {
    try {
      const result = await trpc.getNoteAttachments.query(note.id);
      setAttachments(result);
    } catch (error) {
      console.error('Failed to load attachments:', error);
    }
  }, [note.id]);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setSelectedFolder(note.folder_id || 'none');
    setHasUnsavedChanges(false);
    loadNoteTags();
    loadAttachments();
  }, [note, loadNoteTags, loadAttachments]);

  useEffect(() => {
    setHasUnsavedChanges(
      title !== note.title || 
      content !== note.content || 
      selectedFolder !== (note.folder_id || 'none')
    );
  }, [title, content, selectedFolder, note]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updatedNote = await trpc.updateNote.mutate({
        id: note.id,
        title: title || 'Untitled',
        content,
        folder_id: selectedFolder === 'none' ? null : selectedFolder
      });
      onNoteUpdate(updatedNote);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="text-lg font-semibold border-none shadow-none p-0 focus-visible:ring-0"
          />
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <SaveIcon className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {/* Folder Selection */}
          <div className="flex items-center gap-2">
            <FolderIcon className="w-4 h-4 text-gray-500" />
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="No folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder</SelectItem>
                {folders.map((folder: Folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-gray-500" />
            <div className="flex flex-wrap gap-1">
              {noteTags.map((tag: Tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  style={{ backgroundColor: tag.color || '#3b82f6', color: 'white' }}
                >
                  {tag.name}
                </Badge>
              ))}
              <TagManager
                noteId={note.id}
                availableTags={tags}
                noteTags={noteTags}
                onTagsUpdate={loadNoteTags}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        <div className="flex-1 p-4">
          <Textarea
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            placeholder="Start writing your note..."
            className="w-full h-full resize-none border-none shadow-none focus-visible:ring-0 text-base leading-relaxed"
          />
        </div>

        {/* Attachments Sidebar */}
        {attachments.length > 0 && (
          <div className="w-80 border-l border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4">Attachments</h3>
            <AttachmentManager
              noteId={note.id}
              attachments={attachments}
              onAttachmentsUpdate={loadAttachments}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last updated: {note.updated_at.toLocaleString()}
          </div>
          <AttachmentManager
            noteId={note.id}
            attachments={attachments}
            onAttachmentsUpdate={loadAttachments}
            showAttachButton={true}
          />
        </div>
      </div>
    </div>
  );
}
