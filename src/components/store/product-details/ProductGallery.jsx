'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProductGallery({ images, mainImage, productName }) {
  const [selectedImage, setSelectedImage] = useState(mainImage || (images && images[0]));
  const [imageLoading, setImageLoading] = useState(true);

  // Toutes les images disponibles
  const allImages = mainImage ? [mainImage, ...(images || [])] : (images || []);
  const displayImages = [...new Set(allImages)]; // Supprimer les doublons

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  if (displayImages.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Image non disponible</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Image principale */}
      <div className="mb-4">
        <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden h-72 md:h-96 lg:h-[600px]">
        {selectedImage && (
            <>
            <Image
                src={selectedImage}
                alt={productName}
                width={800}
                height={600}
                className="w-full h-full object-cover transition-opacity duration-300"
                onLoad={handleImageLoad}
                priority
            />
            {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}
            </>
        )}
        </div>
      </div>

      {/* Galerie miniatures */}
      {displayImages.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto py-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedImage(image);
                setImageLoading(true);
              }}
              className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                selectedImage === image 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={image}
                alt={`${productName} - Vue ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}