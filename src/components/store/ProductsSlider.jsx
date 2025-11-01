'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

export default function ProductsSlider({ products, autoPlay = true, interval = 4000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const productsPerView = 4;

  const totalSlides = Math.ceil(products.length / productsPerView);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === totalSlides - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (!autoPlay) return;

    const slideInterval = setInterval(nextSlide, interval);
    return () => clearInterval(slideInterval);
  }, [autoPlay, interval, totalSlides]);

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun produit disponible pour le moment
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Slider Container */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div
              key={slideIndex}
              className="flex-shrink-0 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2"
            >
              {products
                .slice(
                  slideIndex * productsPerView,
                  slideIndex * productsPerView + productsPerView
                )
                .map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 z-10"
            aria-label="Slide précédent"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 z-10"
            aria-label="Slide suivant"
          >
            <FaArrowRight className="text-lg" />
          </button>
        </>
      )}

      {/* Indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-gray-800 w-6' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}