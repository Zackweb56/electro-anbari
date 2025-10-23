'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

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

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    setUploading(true);
    
    try {
      if (multiple) {
        // Handle multiple files
        const urls = [];
        for (const file of files.slice(0, maxFiles)) {
          const mockUrl = URL.createObjectURL(file);
          urls.push(mockUrl);
        }
        
        if (onMultipleUpload) {
          onMultipleUpload(urls);
        } else if (onUpload) {
          // Fallback: call onUpload for each file
          urls.forEach(url => onUpload(url));
        }
      } else {
        // Handle single file
        const file = files[0];
        const mockUrl = URL.createObjectURL(file);
        
        if (onUpload) {
          onUpload(mockUrl);
        }
        if (onChange) {
          onChange(mockUrl);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
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
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? 'Upload...' : buttonText}
        {multiple && ` (Max: ${maxFiles})`}
      </Button>
    </div>
  );
}