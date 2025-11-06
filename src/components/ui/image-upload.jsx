'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, AlertCircle } from 'lucide-react';

export function ImageUpload({ 
  onUpload, 
  onMultipleUpload, 
  value, 
  onChange,
  buttonText = "Télécharger une image",
  multiple = false,
  maxFiles = 5, // Reduced from 10 to 5 for performance
  currentImages = [], // Track current number of images
}) {
  const [uploading, setUploading] = useState(false);
  const isLimitReached = multiple && currentImages.length >= maxFiles;
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [error, setError] = useState('');

  // Validation function
  const validateFile = (file) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Le fichier "${file.name}" n'est pas supporté. Utilisez JPEG, PNG ou WebP.`);
    }

    // Check file name length and special characters
    if (file.name.length > 100) {
      throw new Error(`Le nom du fichier "${file.name}" est trop long. Maximum 100 caractères.`);
    }
    if (/[^a-zA-Z0-9-_. ]/.test(file.name)) {
      throw new Error(`Le nom du fichier "${file.name}" contient des caractères spéciaux non autorisés.`);
    }

    // Check file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      throw new Error(`L'image "${file.name}" est trop lourde. Taille maximum: 2MB.`);
    }

    // Check if file is actually an image
    if (!file.type.startsWith('image/')) {
      throw new Error(`Le fichier "${file.name}" n'est pas une image valide.`);
    }

    // Skip dimension checks; only type/name/size validations are enforced
    return Promise.resolve();
  };

  const uploadToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Check for specific HTTP error codes
        if (response.status === 413) {
          throw new Error('Image trop volumineuse pour le serveur. Maximum 2MB.');
        } else if (response.status === 415) {
          throw new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP.');
        } else if (response.status === 429) {
          throw new Error('Trop de téléchargements. Veuillez réessayer dans quelques instants.');
        } else if (response.status === 401 || response.status === 403) {
          throw new Error('Accès non autorisé. Veuillez vous reconnecter.');
        }
        throw new Error('Échec du téléchargement. Veuillez réessayer.');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Échec du téléchargement. Veuillez réessayer.');
      }

      if (!result.url || !result.url.startsWith('http')) {
        throw new Error('URL d\'image invalide reçue du serveur.');
      }

      return result.url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      // If not already a custom error message, wrap it in a user-friendly message
      if (!error.message.includes('trop volumineuse') && 
          !error.message.includes('non supporté') && 
          !error.message.includes('téléchargements')) {
        throw new Error('Une erreur est survenue lors du téléchargement. Veuillez réessayer.');
      }
      throw error;
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    // Check if adding these files would exceed the limit
    if (multiple && (currentImages.length + files.length) > maxFiles) {
      setError(`Vous ne pouvez pas ajouter plus de ${maxFiles} images. ${maxFiles - currentImages.length} image(s) restante(s).`);
      event.target.value = '';
      return;
    }

    // Reset states
    setError('');
    setUploading(true);
    setTotalFiles(Math.min(files.length, maxFiles - currentImages.length));
    setUploadProgress(0);
    
    try {
      // Validate all files first using Promise.all for parallel validation
      const validationPromises = files
        .slice(0, maxFiles)
        .map(file => validateFile(file));
        
      await Promise.all(validationPromises).catch(error => {
        throw error; // Re-throw to be caught by the outer try-catch
      });

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
      setError(error.message);
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
      {/* File requirements info - Show for all uploads with context-specific text */}
      <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-lg">
        <p><strong>Exigences :</strong></p>
        {multiple ? (
          <>
            <p>• Maximum {maxFiles} images par {buttonText.toLowerCase().includes('logo') ? 'marque' : 'produit'}</p>
            <p className={isLimitReached ? "text-orange-600 font-medium" : ""}>
              • {currentImages.length} image(s) téléchargée(s), {maxFiles - currentImages.length} restante(s)
            </p>
          </>
        ) : (
          <p>• Une seule image autorisée{buttonText.toLowerCase().includes('logo') ? ' (logo)' : ''}</p>
        )}
        <p>• 2MB maximum par image</p>
        <p>• Formats: JPEG, PNG, WebP</p>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-start gap-2 p-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium mb-1">Erreur lors du téléchargement</p>
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/jpeg, image/jpg, image/png, image/webp"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={uploading}
          multiple={multiple}
        />
        <Button
          type="button"
          variant={isLimitReached ? "secondary" : "outline"}
          disabled={uploading || isLimitReached}
          onClick={() => document.getElementById('image-upload').click()}
          className="relative"
          title={isLimitReached ? "Limite d'images atteinte" : ""}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : isLimitReached ? (
            <AlertCircle className="w-4 h-4 mr-2" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {uploading 
            ? `Téléchargement... (${currentFileIndex}/${totalFiles})` 
            : isLimitReached
            ? `Limite de ${maxFiles} images atteinte`
            : buttonText
          }
          {/* Show remaining slots for multiple uploads */}
          {multiple && !uploading && !isLimitReached && 
            ` (${currentImages.length}/${maxFiles})`}
        </Button>
      </div>

      {/* Progress Indicator */}
      {uploading && (
        <div className="space-y-2 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-blue-300">
                Téléchargement {currentFileIndex} sur {totalFiles} fichier{totalFiles > 1 ? 's' : ''}
              </span>
            </div>
            <span className="font-medium text-blue-300">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-blue-400">
            Ne fermez pas cette fenêtre pendant le téléchargement...
          </p>
        </div>
      )}
    </div>
  );
}