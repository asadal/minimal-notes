
import { Button } from '@/components/ui/button';
import { MoreHorizontalIcon, TrashIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Note } from '../../../server/src/schema';

interface NoteListProps {
  notes: Note[];
  selectedNote: Note | null;
  onNoteSelect: (note: Note) => void;
  onNoteDelete: (noteId: string) => void;
}

export function NoteList({ notes, selectedNote, onNoteSelect, onNoteDelete }: NoteListProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getPreview = (content: string) => {
    return content.slice(0, 100).replace(/\n/g, ' ') + (content.length > 100 ? '...' : '');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {notes.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <div className="text-4xl mb-2">📄</div>
          <p>No notes found</p>
        </div>
      ) : (
        <div>
          {notes.map((note: Note) => (
            <div
              key={note.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedNote?.id === note.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => onNoteSelect(note)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate mb-1">
                    {note.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {getPreview(note.content)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(note.updated_at)}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 opacity-0 group-hover:opacity-100"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                      <MoreHorizontalIcon className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        onNoteDelete(note.id);
                      }}
                      className="text-red-600"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
