
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { FolderIcon, FolderPlusIcon, PlusIcon, HashIcon } from 'lucide-react';
import type { Folder, Tag } from '../../../server/src/schema';

interface SidebarProps {
  folders: Folder[];
  tags: Tag[];
  selectedFolder: string | null;
  selectedTag: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onTagSelect: (tagId: string | null) => void;
  onFolderCreate: () => void;
  onTagCreate: () => void;
  userId: string;
}

export function Sidebar({
  folders,
  tags,
  selectedFolder,
  selectedTag,
  onFolderSelect,
  onTagSelect,
  onFolderCreate,
  onTagCreate,
  userId
}: SidebarProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsLoading(true);
    try {
      await trpc.createFolder.mutate({
        name: newFolderName,
        user_id: userId
      });
      setNewFolderName('');
      setFolderDialogOpen(false);
      onFolderCreate();
    } catch (error) {
      console.error('Failed to create folder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsLoading(true);
    try {
      await trpc.createTag.mutate({
        name: newTagName,
        user_id: userId,
        color: newTagColor
      });
      setNewTagName('');
      setNewTagColor('#3b82f6');
      setTagDialogOpen(false);
      onTagCreate();
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-6">📝 Notes</h1>
        
        {/* All Notes */}
        <Button
          variant={!selectedFolder && !selectedTag ? "default" : "ghost"}
          className="w-full justify-start mb-4"
          onClick={() => {
            onFolderSelect(null);
            onTagSelect(null);
          }}
        >
          <FolderIcon className="w-4 h-4 mr-2" />
          All Notes
        </Button>

        {/* Folders Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Folders</h3>
            <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <FolderPlusIcon className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateFolder}>
                  <Input
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFolderName(e.target.value)}
                    className="mb-4"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setFolderDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-1">
            {folders.map((folder: Folder) => (
              <Button
                key={folder.id}
                variant={selectedFolder === folder.id ? "default" : "ghost"}
                className="w-full justify-start text-sm"
                onClick={() => {
                  onFolderSelect(folder.id);
                  onTagSelect(null);
                }}
              >
                <FolderIcon className="w-4 h-4 mr-2" />
                {folder.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Tags</h3>
            <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Tag</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTag}>
                  <Input
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTagName(e.target.value)}
                    className="mb-4"
                    autoFocus
                  />
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <input
                      type="color"
                      value={newTagColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTagColor(e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setTagDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-1">
            {tags.map((tag: Tag) => (
              <Button
                key={tag.id}
                variant={selectedTag === tag.id ? "default" : "ghost"}
                className="w-full justify-start text-sm"
                onClick={() => {
                  onTagSelect(tag.id);
                  onFolderSelect(null);
                }}
              >
                <HashIcon className="w-4 h-4 mr-2" />
                <Badge 
                  variant="secondary" 
                  className="mr-2"
                  style={{ backgroundColor: tag.color || '#3b82f6', color: 'white' }}
                >
                  {tag.name}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
