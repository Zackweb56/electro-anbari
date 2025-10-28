import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaShoppingCart, FaWhatsapp } from 'react-icons/fa';

export default function ProductCard({ product }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Determine stock status
  const getStockStatus = () => {
    if (!product.stock) return { text: 'Stock indisponible', color: 'text-red-600', bg: 'bg-red-100' };

    const { currentQuantity, status } = product.stock;

    switch (status) {
      case 'out_of_stock':
        return { text: 'Rupture de stock', color: 'text-red-600', bg: 'bg-red-100' };
      case 'low_stock':
        return { text: `Stock faible (${currentQuantity})`, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'in_stock':
        return { text: 'En stock', color: 'text-green-600', bg: 'bg-green-100' };
      default:
        return { text: 'Stock indisponible', color: 'text-red-600', bg: 'bg-red-100' };
    }
  };

  const stockStatus = getStockStatus();
  const displayImage = product.mainImage || (product.images && product.images[0]);

  // WhatsApp message text with relevant product details
  const whatsappMessage = encodeURIComponent(
    `Bonjour, je souhaite commander ce produit :\n` +
    `Nom: ${product.name}\n` +
    `Prix: ${product.price} MAD\n` +
    (product.stock && product.stock.currentQuantity !== undefined ? `Quantité en stock: ${product.stock.currentQuantity}\n` : '') +
    `Lien produit: https://yourdomain.com/product/${product.slug}`
  );

  const whatsappNumber = '+212771615622';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${whatsappMessage}`;

  // Handle add to cart (static for now)
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    alert(`Produit "${product.name}" ajouté au panier (fonctionnalité à venir)`);
  };

  // Calculate discount percentage if comparePrice exists
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group product-card">
      <Link href={`/product/${product.slug}`}>
        <div className="w-full h-56 bg-white flex items-center justify-center relative">
          {displayImage && !imageError ? (
            <>
              <Image
                src={displayImage}
                alt={product.name}
                width={250}
                height={180}
                className="w-auto h-full max-h-52 object-contain group-hover:scale-105 transition-transform duration-300"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">Image non disponible</span>
            </div>
          )}

          {/* Stock status badge top-left */}
          <span className={`absolute top-2 left-2 z-10 text-xs font-medium px-2 py-1 rounded-full ${stockStatus.color} ${stockStatus.bg}`}>
            {stockStatus.text}
          </span>

          {/* Discount badge under stock badge */}
          {hasDiscount && (
            <div className="absolute top-10 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discountPercentage}%
            </div>
          )}

          {/* Featured badge */}
          {product.isFeatured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              Populaire
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        {/* Product title as link */}
        <Link href={`/product/${product.slug}`}>
          <div className="flex items-start justify-between mb-2 group">
            <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </div>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              {product.price} MAD
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {product.comparePrice} MAD
              </span>
            )}
          </div>

          {/* Removed stock status from here as it's now top-left on image */}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2 mt-3">
          {/* WhatsApp button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
            aria-label="Commander via WhatsApp"
          >
            <FaWhatsapp className="w-4 h-4 mr-2" />
            WhatsApp
          </a>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Ajouter au panier"
          >
            <FaShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}