import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, CheckCircle, AlertCircle } from 'lucide-react';

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
  console.log('🖼️ FileUpload Component Debug - Props received:', {
    type,
    currentFile,
    isEditing,
    accept,
    maxSize
  });
  
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

  const getFileIcon = () => {
    if (type === 'image') {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    return <File className="w-8 h-8 text-green-500" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}

      {/* Current File Display */}
      {currentFile && !selectedFile && (
        <div className="space-y-4">
          {console.log('🖼️ FileUpload Display Debug - Showing current file:', currentFile)}
          {/* Image Preview for Image Type */}
          {type === 'image' && (
            <div className="relative w-full max-w-40 h-40">
              {console.log('🖼️ FileUpload Image Debug - Rendering image with src:', currentFile)}
              <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-lg w-full h-full group">
                <img 
                  src={currentFile} 
                  alt="Profile Picture" 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onLoad={() => console.log('🖼️ FileUpload Image Debug - Image loaded successfully:', currentFile)}
                  onError={(e) => console.error('🖼️ FileUpload Image Debug - Image failed to load:', currentFile, e)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
                              {/* Remove Button Overlay - Only Visible When Editing */}
                {isEditing && (
                  <button
                    onClick={handleRemove}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-10"
                    title="Remove profile picture"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
            </div>
          )}
          
          {/* Document Preview for Document Type */}
          {type === 'document' && (
            <div className="relative w-full max-w-56 h-40">
              <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-lg bg-gradient-to-br from-gray-50 to-white w-full h-full group">
                <div className="flex flex-col items-center justify-center h-full space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <File className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 text-center">Resume Uploaded</h3>
                </div>
                
                {/* Remove Button Overlay - Only Visible When Editing */}
                {isEditing && (
                  <button
                    onClick={handleRemove}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-10"
                    title="Remove resume"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* File Upload Area */}
      {(!currentFile || selectedFile) && (
        <div
          className={`relative border-2 border-solid rounded-lg p-8 transition-all duration-200 ${
            type === 'document' ? 'w-full max-w-md h-40' : 'w-full max-w-sm h-40'
          } ${
            dragActive
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : selectedFile
              ? 'border-green-500 bg-green-50 shadow-lg'
              : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md'
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
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {selectedFile ? (
            <div className="text-center h-full flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                {getFileIcon()}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
              
              {/* Only show manual upload buttons if onFileSelect is not provided (manual upload mode) */}
              {!onFileSelect && (
                <div className="flex justify-center space-x-2 mt-4">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      'Upload'
                    )}
                  </button>
                  <button
                    onClick={handleRemove}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Show uploading status for automatic upload */}
              {onFileSelect && uploading && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                  <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-sm text-blue-600">Uploading...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center h-full flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-900">
                  <span className="text-blue-600 hover:text-blue-700 cursor-pointer transition-colors">
                    Click to upload
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  {type === 'image' 
                    ? `PNG, JPG, GIF up to ${maxSize}MB`
                    : `PDF, DOC, DOCX up to ${maxSize}MB`
                  }
                </p>
                <p className="text-xs text-gray-400">
                  or drag and drop
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
