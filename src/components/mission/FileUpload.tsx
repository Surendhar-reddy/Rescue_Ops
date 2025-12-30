import { useState, useCallback } from 'react';
import { Upload, X, FileVideo, FileImage, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  uploading: boolean;
  url?: string;
}

interface FileUploadProps {
  missionId?: string;
  onFilesChange: (files: UploadedFile[]) => void;
  files: UploadedFile[];
}

const FileUpload = ({ missionId, onFilesChange, files }: FileUploadProps) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragOver(true);
    } else if (e.type === 'dragleave') {
      setDragOver(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type)) {
      toast.error(`Invalid file type: ${file.name}. Supported: JPG, PNG, WEBP, MP4, WEBM`);
      return false;
    }

    if (file.size > maxSize) {
      toast.error(`File too large: ${file.name}. Maximum size: 100MB`);
      return false;
    }

    return true;
  };

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = [];

    Array.from(fileList).forEach(file => {
      if (!validateFile(file)) return;

      const uploadedFile: UploadedFile = {
        id: crypto.randomUUID(),
        file,
        progress: 0,
        uploading: false,
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        uploadedFile.preview = URL.createObjectURL(file);
      }

      newFiles.push(uploadedFile);
    });

    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    onFilesChange(files.filter(f => f.id !== id));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('video/')) {
      return <FileVideo className="h-8 w-8 text-secondary" />;
    }
    return <FileImage className="h-8 w-8 text-primary" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`upload-zone cursor-pointer transition-all ${
          dragOver ? 'border-primary bg-primary/5' : ''
        }`}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Upload className={`h-10 w-10 mx-auto mb-4 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="text-foreground font-medium">
          Drop drone footage or satellite images here
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Supports: JPG, PNG, WEBP, MP4, WEBM • Max 100MB per file
        </p>
        <Button variant="outline" className="mt-4" type="button">
          Browse Files
        </Button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Queued Files ({files.length})
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map(uploadedFile => (
              <div
                key={uploadedFile.id}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg animate-fade-in"
              >
                {/* Preview or Icon */}
                <div className="w-12 h-12 rounded bg-background flex items-center justify-center overflow-hidden flex-shrink-0">
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getFileIcon(uploadedFile.file)
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                  {uploadedFile.uploading && (
                    <Progress value={uploadedFile.progress} className="h-1 mt-1" />
                  )}
                </div>

                {/* Status / Remove */}
                {uploadedFile.uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFile(uploadedFile.id)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export type { UploadedFile };
export default FileUpload;
