
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { trpc } from '@/utils/trpc';
import { PlusIcon, CheckIcon } from 'lucide-react';
import type { Tag } from '../../../server/src/schema';

interface TagManagerProps {
  noteId: string;
  availableTags: Tag[];
  noteTags: Tag[];
  onTagsUpdate: () => void;
}

export function TagManager({ noteId, availableTags, noteTags, onTagsUpdate }: TagManagerProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTagToggle = async (tag: Tag) => {
    setIsLoading(true);
    try {
      const isTagged = noteTags.some((noteTag: Tag) => noteTag.id === tag.id);
      
      if (isTagged) {
        await trpc.removeTagFromNote.mutate({
          note_id: noteId,
          tag_id: tag.id
        });
      } else {
        await trpc.addTagToNote.mutate({
          note_id: noteId,
          tag_id: tag.id
        });
      }
      
      onTagsUpdate();
    } catch (error) {
      console.error('Failed to toggle tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <PlusIcon className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search tags..." />
          <CommandEmpty>No tags found.</CommandEmpty>
          <CommandGroup>
            {availableTags.map((tag: Tag) => {
              const isTagged = noteTags.some((noteTag: Tag) => noteTag.id === tag.id);
              return (
                <CommandItem
                  key={tag.id}
                  onSelect={() => handleTagToggle(tag)}
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{ backgroundColor: tag.color || '#3b82f6', color: 'white' }}
                    >
                      {tag.name}
                    </Badge>
                  </div>
                  {isTagged && <CheckIcon className="w-4 h-4" />}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
