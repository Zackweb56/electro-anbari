'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';

export function ImageUpload({ 
  onUpload, 
  onMultipleUpload, 
  value, 
  onChange,
  buttonText = "Upload Image",
  multiple = false,
  maxFiles = 10
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const uploadToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      return result.url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setUploading(true);
    setTotalFiles(Math.min(files.length, maxFiles));
    setUploadProgress(0);
    
    try {
      if (multiple) {
        // Handle multiple files with progress
        const filesToUpload = files.slice(0, maxFiles);
        const cloudinaryUrls = [];
        
        for (let i = 0; i < filesToUpload.length; i++) {
          setCurrentFileIndex(i + 1);
          const url = await uploadToCloudinary(filesToUpload[i]);
          cloudinaryUrls.push(url);
          
          // Update progress
          const progress = Math.round(((i + 1) / filesToUpload.length) * 100);
          setUploadProgress(progress);
        }
        
        if (onMultipleUpload) {
          onMultipleUpload(cloudinaryUrls);
        } else if (onUpload) {
          cloudinaryUrls.forEach(url => onUpload(url));
        }
      } else {
        // Handle single file
        const file = files[0];
        setCurrentFileIndex(1);
        setTotalFiles(1);
        
        const cloudinaryUrl = await uploadToCloudinary(file);
        setUploadProgress(100);
        
        if (onUpload) {
          onUpload(cloudinaryUrl);
        }
        if (onChange) {
          onChange(cloudinaryUrl);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setCurrentFileIndex(0);
      setTotalFiles(0);
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={uploading}
          multiple={multiple}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => document.getElementById('image-upload').click()}
          className="relative"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {uploading ? `Uploading... (${currentFileIndex}/${totalFiles})` : buttonText}
          {multiple && !uploading && ` (Max: ${maxFiles})`}
        </Button>
      </div>

      {/* Progress Indicator */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>
              Uploading {currentFileIndex} of {totalFiles} files
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}