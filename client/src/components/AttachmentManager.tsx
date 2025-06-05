
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { PaperclipIcon, DownloadIcon, TrashIcon, FileTextIcon, ImageIcon } from 'lucide-react';
import type { Attachment } from '../../../server/src/schema';

interface AttachmentManagerProps {
  noteId: string;
  attachments: Attachment[];
  onAttachmentsUpdate: () => void;
  showAttachButton?: boolean;
}

export function AttachmentManager({ 
  noteId, 
  attachments, 
  onAttachmentsUpdate, 
  showAttachButton = false 
}: AttachmentManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        // In a real app, you'd upload the file to a storage service first
        // For now, we'll simulate creating an attachment record
        await trpc.createAttachment.mutate({
          note_id: noteId,
          filename: `${Date.now()}-${file.name}`,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type,
          file_path: `/uploads/${Date.now()}-${file.name}`
        });
      }
      onAttachmentsUpdate();
    } catch (error) {
      console.error('Failed to upload attachments:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await trpc.deleteAttachment.mutate(attachmentId);
      onAttachmentsUpdate();
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    } else if (mimeType === 'application/pdf') {
      return <FileTextIcon className="w-4 h-4" />;
    } else {
      return <PaperclipIcon className="w-4 h-4" />;
    }
  };

  const isPDF = (mimeType: string) => mimeType === 'application/pdf';
  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  return (
    <div>
      {showAttachButton && (
        <>
          <Button
            onClick={handleFileSelect}
            disabled={isUploading}
            variant="outline"
            size="sm"
          >
            <PaperclipIcon className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Attach Files'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment: Attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(attachment.mime_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.original_filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.file_size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* PDF Preview for PDF files */}
                {isPDF(attachment.mime_type) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // In a real app, you'd open the PDF in a modal or new tab
                      console.log('Open PDF preview for:', attachment.file_path);
                    }}
                  >
                    <FileTextIcon className="w-4 h-4" />
                  </Button>
                )}

                {/* Image Preview for images */}
                {isImage(attachment.mime_type) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // In a real app, you'd show the image in a modal
                      console.log('Show image preview for:', attachment.file_path);
                    }}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // In a real app, you'd download the file
                    console.log('Download:', attachment.file_path);
                  }}
                >
                  <DownloadIcon className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAttachment(attachment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
