'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { 
  FaArrowLeft, 
  FaArrowRight,
  FaShoppingCart,
  FaEye
} from 'react-icons/fa';

export default function ProductsSlider({ products, autoPlay = true, interval = 6000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [productsPerView, setProductsPerView] = useState(4); // Default for desktop

  // Update products per view based on screen size
  useEffect(() => {
    const updateProductsPerView = () => {
      if (window.innerWidth < 640) { // sm breakpoint
        setProductsPerView(1);
      } else if (window.innerWidth < 1024) { // md breakpoint
        setProductsPerView(2);
      } else { // lg breakpoint and above
        setProductsPerView(4);
      }
    };

    // Initial update
    updateProductsPerView();

    // Add event listener for window resize
    window.addEventListener('resize', updateProductsPerView);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateProductsPerView);
  }, []);

  // Calculate total slides for one-by-one movement
  const totalSlides = Math.max(products.length - productsPerView + 1, 1);

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
    if (!autoPlay || products.length <= productsPerView) return;

    const slideInterval = setInterval(nextSlide, interval);
    return () => clearInterval(slideInterval);
  }, [autoPlay, interval, products.length, productsPerView]);

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun produit disponible pour le moment
      </div>
    );
  }

  // If we have fewer products than the view, just show them all
  if (products.length <= productsPerView) {
    return (
      <div className={`
        grid gap-6
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-4
      `}>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Slider Container */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / productsPerView)}%)` 
          }}
        >
          {products.map((product, index) => (
            <div
              key={product._id}
              className="flex-shrink-0"
              style={{ width: `${100 / productsPerView}%` }}
            >
              <div className="px-2 sm:px-3">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
          
          {/* Add duplicate products for infinite loop effect */}
          {products.slice(0, productsPerView).map((product, index) => (
            <div
              key={`duplicate-${product._id}-${index}`}
              className="flex-shrink-0"
              style={{ width: `${100 / productsPerView}%` }}
            >
              <div className="px-2 sm:px-3">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {products.length > productsPerView && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 sm:p-3 shadow-lg transition-all duration-200 z-10"
            aria-label="Slide précédent"
          >
            <FaArrowLeft className="text-base sm:text-lg" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 sm:p-3 shadow-lg transition-all duration-200 z-10"
            aria-label="Slide suivant"
          >
            <FaArrowRight className="text-base sm:text-lg" />
          </button>
        </>
      )}

      {/* Indicators */}
      {products.length > productsPerView && (
        <div className="flex justify-center mt-4 sm:mt-6 space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-gray-800' 
                  : 'bg-gray-300 hover:bg-gray-400'
              } ${
                // Responsive indicator sizes
                index === currentIndex 
                  ? 'w-4 sm:w-6 h-2' 
                  : 'w-2 h-2'
              }`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}