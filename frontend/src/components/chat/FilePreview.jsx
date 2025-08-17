import React from 'react';
import { 
  Download, 
  Eye, 
  X, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  File
} from 'lucide-react';
import { cn, formatFileSize, isImageFile, isVideoFile } from '../../lib/utils';

const FilePreview = ({ file, onRemove, onDownload, onView, className = "" }) => {
  const getFileIcon = (filename) => {
    const extension = filename.toLowerCase().split('.').pop();
    
    if (isImageFile(filename)) return <Image className="w-8 h-8 text-blue-500" />;
    if (isVideoFile(filename)) return <Video className="w-8 h-8 text-red-500" />;
    
    const iconMap = {
      // Documents
      'pdf': <FileText className="w-8 h-8 text-red-600" />,
      'doc': <FileText className="w-8 h-8 text-blue-600" />,
      'docx': <FileText className="w-8 h-8 text-blue-600" />,
      'txt': <FileText className="w-8 h-8 text-gray-500" />,
      
      // Audio
      'mp3': <Music className="w-8 h-8 text-purple-500" />,
      'wav': <Music className="w-8 h-8 text-purple-500" />,
      'flac': <Music className="w-8 h-8 text-purple-500" />,
      
      // Archives
      'zip': <Archive className="w-8 h-8 text-yellow-500" />,
      'rar': <Archive className="w-8 h-8 text-yellow-500" />,
      '7z': <Archive className="w-8 h-8 text-yellow-500" />,
    };
    
    return iconMap[extension] || <File className="w-8 h-8 text-gray-400" />;
  };

  const getPreviewImage = () => {
    if (file.preview && (isImageFile(file.name) || isVideoFile(file.name))) {
      return (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-base-200">
          <img 
            src={file.preview} 
            alt={file.name}
            className="w-full h-full object-cover"
          />
          {isVideoFile(file.name) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="w-20 h-20 rounded-lg bg-base-200 flex items-center justify-center">
        {getFileIcon(file.name)}
      </div>
    );
  };

  return (
    <div className={cn("flex items-center gap-3 p-3 bg-base-100 border border-base-300 rounded-xl hover:bg-base-50 transition-colors", className)}>
      {/* File Preview/Icon */}
      {getPreviewImage()}
      
      {/* File Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate" title={file.name}>
          {file.name}
        </h4>
        <p className="text-xs text-base-content/60 mt-1">
          {formatFileSize(file.size)}
        </p>
        
        {/* Upload Progress */}
        {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-base-content/60">Uploading...</span>
              <span className="text-primary font-medium">{file.uploadProgress}%</span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${file.uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {(isImageFile(file.name) || isVideoFile(file.name)) && onView && (
          <button
            onClick={() => onView(file)}
            className="btn btn-ghost btn-xs btn-circle"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        
        {onDownload && (
          <button
            onClick={() => onDownload(file)}
            className="btn btn-ghost btn-xs btn-circle"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
        
        {onRemove && (
          <button
            onClick={() => onRemove(file)}
            className="btn btn-ghost btn-xs btn-circle text-error hover:bg-error/10"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Image/Video Gallery Component
export const MediaGallery = ({ files, currentIndex, onClose, onNext, onPrevious }) => {
  const currentFile = files[currentIndex];
  
  if (!currentFile) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="font-semibold truncate">{currentFile.name}</h3>
            <p className="text-sm opacity-70">{formatFileSize(currentFile.size)}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-70">
              {currentIndex + 1} of {files.length}
            </span>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-circle text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {files.length > 1 && (
        <>
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost text-white hover:bg-white/20 disabled:opacity-30"
          >
            ←
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex === files.length - 1}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 btn btn-circle btn-ghost text-white hover:bg-white/20 disabled:opacity-30"
          >
            →
          </button>
        </>
      )}

      {/* Media Content */}
      <div className="max-w-4xl max-h-full p-8">
        {isImageFile(currentFile.name) ? (
          <img
            src={currentFile.preview || currentFile.url}
            alt={currentFile.name}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        ) : isVideoFile(currentFile.name) ? (
          <video
            src={currentFile.preview || currentFile.url}
            controls
            className="max-w-full max-h-full rounded-lg"
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <div className="bg-base-100 p-8 rounded-xl text-center">
            <div className="mb-4">
              {getFileIcon(currentFile.name)}
            </div>
            <h3 className="font-semibold mb-2">{currentFile.name}</h3>
            <p className="text-base-content/60 mb-4">{formatFileSize(currentFile.size)}</p>
            <button className="btn btn-primary">
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-center gap-4">
          <button className="btn btn-ghost btn-circle text-white hover:bg-white/20">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;
