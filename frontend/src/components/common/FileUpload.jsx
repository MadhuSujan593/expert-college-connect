import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, CheckCircle, AlertCircle, CloudUpload } from 'lucide-react';

// Helper function to validate file types
const isValidFileType = (fileType, acceptString) => {
  if (!acceptString) return true;

  const acceptedTypes = acceptString.split(',').map(type => type.trim());

  return acceptedTypes.some(acceptedType => {
    if (acceptedType === '*/*') return true;
    if (acceptedType.endsWith('/*')) {
      // Handle wildcard types like "image/*"
      const category = acceptedType.slice(0, -2);
      return fileType.startsWith(category + '/');
    }
    // Handle specific types like "image/jpeg" or file extensions like ".pdf"
    if (acceptedType.startsWith('.')) {
      // File extension validation would need the actual filename
      return true; // Skip extension validation for now, rely on MIME type
    }
    return fileType === acceptedType;
  });
};

const FileUpload = ({
  onFileSelect,
  onUpload,
  onRemove,
  accept,
  maxSize = 5,
  type = 'image', // 'image' or 'document'
  currentFile = null,
  label,
  description,
  className = '',
  isEditing = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setError('');

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (accept && !isValidFileType(file.type, accept)) {
      setError('Invalid file type');
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) {
      // If onFileSelect is provided, upload immediately and don't show upload buttons
      setUploading(true);

      // Handle async upload
      Promise.resolve(onFileSelect(file))
        .then(() => {
          // Clear selected file after successful upload
          setSelectedFile(null);
          if (inputRef.current) {
            inputRef.current.value = '';
          }
        })
        .catch((error) => {
          console.error('Upload failed:', error);
          setError('Upload failed. Please try again.');
        })
        .finally(() => {
          setUploading(false);
        });
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-1">
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
      )}

      {/* Current File Display (Preview) */}
      {currentFile && !selectedFile && (
        <div className="space-y-4">
          {type === 'image' && (
            <div className={`relative group w-full ${type === 'image' ? 'max-w-[180px] h-[180px]' : 'max-w-md h-40'} mx-auto`}>
              <div className="relative overflow-hidden rounded-md border border-slate-200 shadow-sm w-full h-full bg-slate-50 flex items-center justify-center">
                <img
                  src={currentFile}
                  alt="Preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover overlay for editing/removing */}
                {isEditing && (
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                    <p className="text-white text-xs font-medium translate-y-2 group-hover:translate-y-0 transition-transform duration-200">Change Logo</p>
                    <button
                      onClick={handleRemove}
                      className="p-2 bg-white text-rose-500 rounded-full shadow-lg hover:bg-rose-50 transition-colors"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {type === 'document' && (
            <div className="relative w-full max-w-sm h-32 mx-auto">
              <div className="relative overflow-hidden rounded-md border border-slate-200 bg-white p-4 flex items-center gap-4 shadow-sm group">
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <File className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">Document Uploaded</h3>
                  <p className="text-xs text-slate-500">Resume/CV</p>
                </div>
                {isEditing && (
                  <button
                    onClick={handleRemove}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-rose-50 border border-rose-200 rounded-md">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <p className="text-xs font-medium text-rose-700">{error}</p>
        </div>
      )}

      {/* File Upload Area */}
      {(!currentFile || selectedFile) && (
        <div
          className={`relative border border-dashed rounded-lg p-8 transition-all duration-200 text-center ${type === 'document' ? 'w-full max-w-md h-40' : 'w-full max-w-[280px] h-[180px]' // Fixed dimensions for consistency
            } mx-auto flex flex-col items-center justify-center bg-slate-50/50 ${dragActive
              ? 'border-indigo-500 bg-indigo-50/30'
              : selectedFile
                ? 'border-slate-300 bg-white' // REMOVED green styling here
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            disabled={uploading}
          />

          {selectedFile ? (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
              {uploading ? (
                <>
                  <div className="w-10 h-10 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">Uploading...</p>
                    <p className="text-xs text-slate-500">{selectedFile.name}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-1">
                    {type === 'image' ? <Image className="w-5 h-5" /> : <File className="w-5 h-5" />}
                  </div>
                  <div className="space-y-1 max-w-full px-4">
                    <p className="text-sm font-bold text-slate-900 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                  </div>

                  {!onFileSelect && (
                    <div className="flex gap-2 mt-2 z-10 relative">
                      {/* z-10 to be above the file input if needed, but in this structure input covers all. 
                             Actually, since input covers all, we can't click buttons inside. 
                             For manual upload mode, we need to hide the input or position buttons above it.
                             However, based on usage in profile, we usually use auto-upload (onFileSelect).
                         */}
                      <button onClick={(e) => { e.stopPropagation(); handleUpload(); }} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700">Upload</button>
                      <button onClick={(e) => { e.stopPropagation(); handleRemove(); }} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded hover:bg-slate-50">Cancel</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="pointer-events-none"> {/* Prevent blocking the file input clicks */}
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <CloudUpload className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  Click or drag to upload
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium">
                  {type === 'image'
                    ? `PNG, JPG, WebP, AVIF up to ${maxSize}MB`
                    : `PDF, DOC, DOCX up to ${maxSize}MB`
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
