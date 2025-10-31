"use client";

import { useState, useEffect } from 'react'; // Added useEffect
import Image from 'next/image';
import Link from 'next/link';
import { FaShoppingCart, FaWhatsapp, FaSpinner } from 'react-icons/fa';

// Cart utilities (you can move this to a separate file later)
const cartUtils = {
  getCart: () => {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('cart') || '[]')
  },

  addToCart: async (product, quantity = 1) => {
    try {
      // Validate stock via API
      const stockResponse = await fetch(`/api/public/products/${product.slug}`)
      const stockData = await stockResponse.json()
      
      if (!stockData.success || !stockData.product) {
        throw new Error('Produit non disponible')
      }

      const currentStock = stockData.product.stock?.currentQuantity || 0
      
      if (currentStock < quantity) {
        throw new Error(`Stock insuffisant. Il reste ${currentStock} unité(s)`)
      }

      // Add to localStorage cart
      const cart = cartUtils.getCart()
      const existingItem = cart.find(item => item.id === product._id)

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > currentStock) {
          throw new Error(`Quantité maximale atteinte. Stock: ${currentStock}`)
        }
        existingItem.quantity = newQuantity
      } else {
        cart.push({
          id: product._id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          comparePrice: product.comparePrice,
          image: product.mainImage || product.images?.[0],
          quantity: quantity,
          maxStock: currentStock,
          brand: product.brand?.name,
          category: product.category?.name,
          specifications: product.specifications
        })
      }

      localStorage.setItem('cart', JSON.stringify(cart))
      return { success: true, cart }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  getCartCount: () => {
    const cart = cartUtils.getCart()
    return cart.reduce((total, item) => total + item.quantity, 0)
  }
};

export default function ProductCard({ product }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('#'); // Initialize with '#'

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
        return { text: `En stock (${currentQuantity})`, color: 'text-green-600', bg: 'bg-green-100' };
      default:
        return { text: 'Stock indisponible', color: 'text-red-600', bg: 'bg-red-100' };
    }
  };

  const stockStatus = getStockStatus();
  const displayImage = product.mainImage || (product.images && product.images[0]);

  // Set WhatsApp URL after component mounts (client-side only)
  useEffect(() => {
    const message = encodeURIComponent(
      `Bonjour, je souhaite commander ce produit :\n` +
      `Nom: ${product.name}\n` +
      `Prix: ${product.price} MAD\n` +
      (product.comparePrice ? `Prix de comparaison: ${product.comparePrice} MAD\n` : '') +
      (product.stock && product.stock.currentQuantity !== undefined ? `Quantité en stock: ${product.stock.currentQuantity}\n` : '') +
      `Lien produit: ${window.location.origin}/product/${product.slug}`
    );

    const whatsappNumber = '+212771615622';
    setWhatsappUrl(`https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${message}`);
  }, [product]); // Add product as dependency

  // Handle add to cart with validation
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't add to cart if out of stock
    if (product.stock?.status === 'out_of_stock') {
      setCartMessage('Produit en rupture de stock');
      setTimeout(() => setCartMessage(''), 3000);
      return;
    }

    setAddingToCart(true);
    setCartMessage('');
    
    try {
      const result = await cartUtils.addToCart(product, 1);
      
      if (result.success) {
        setCartMessage('✅ Produit ajouté au panier!');
        // Trigger cart update in header and other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } else {
        setCartMessage(`❌ ${result.error}`);
      }
    } catch (error) {
      setCartMessage('❌ Erreur lors de l\'ajout au panier');
      console.error('Cart error:', error);
    } finally {
      setAddingToCart(false);
      setTimeout(() => setCartMessage(''), 3000);
    }
  };

  // Calculate discount percentage if comparePrice exists
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  // Check if product can be added to cart
  const canAddToCart = product.stock?.status !== 'out_of_stock';

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
          <Link
            href={whatsappUrl}
            passHref
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
            aria-label="Commander via WhatsApp"
          >
            <FaWhatsapp className="w-4 h-4 mr-2" />
            WhatsApp
          </Link>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || !canAddToCart}
            className={`inline-flex items-center justify-center px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
              canAddToCart
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            } ${addingToCart ? 'opacity-70 cursor-wait' : ''}`}
            aria-label={canAddToCart ? "Ajouter au panier" : "Produit indisponible"}
            title={canAddToCart ? "Ajouter au panier" : "Produit en rupture de stock"}
          >
            {addingToCart ? (
              <FaSpinner className="w-4 h-4 animate-spin" />
            ) : (
              <FaShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {/* Cart message */}
        {cartMessage && (
          <div className={`mt-2 text-xs text-center p-2 rounded transition-all duration-300 ${
            cartMessage.includes('✅') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {cartMessage}
          </div>
        )}

      </div>
    </div>
  );
}