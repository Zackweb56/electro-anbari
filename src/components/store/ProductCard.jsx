"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaShoppingCart, FaSpinner, FaEye } from 'react-icons/fa';
import { 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Monitor, 
  Cctv, 
  Battery, 
  Keyboard, 
  Smartphone 
} from 'lucide-react';
import QuickViewModal from './QuickViewModal';
import WhatsAppOrderButton from './WhatsAppOrderButton';
import AddToCartButton from './AddToCartButton';

// Cart utilities removed in favor of shared AddToCartButton

// Specification icons mapping
const specificationIcons = {
  processor: Cpu,
  ram: MemoryStick,
  storage: HardDrive,
  display: Monitor,
  graphics: Cctv,
  graphics2: Cctv,
  battery: Battery,
  keyboard: Keyboard,
  operatingSystem: Smartphone
};

// Specification labels mapping
const specificationLabels = {
  processor: 'Processeur',
  ram: 'RAM',
  storage: 'Stockage',
  display: 'Écran',
  graphics: 'Carte graphique',
  graphics2: 'Graphique secondaire',
  battery: 'Batterie',
  keyboard: 'Clavier',
  operatingSystem: 'Système'
};

export default function ProductCard({ product }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [quickViewOpen, setQuickViewOpen] = useState(false);

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

  // Prepare WhatsApp message (raw string) for the shared component
  const whatsappMessage = (
    `Bonjour, je souhaite commander ce produit :\n` +
    `Nom: ${product.name}\n` +
    `Prix: ${product.price} MAD\n` +
    (product.comparePrice ? `Prix de comparaison: ${product.comparePrice} MAD\n` : '') +
    (product.stock && product.stock.currentQuantity !== undefined ? `Quantité en stock: ${product.stock.currentQuantity}\n` : '') +
    `Lien produit: ${typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug}` : ''}`
  );

  const handleAddToCartResult = (res) => {
    if (res?.success) {
      setCartMessage('✅ Produit ajouté au panier!');
    } else {
      setCartMessage(`❌ ${res?.error || 'Erreur lors de l\'ajout au panier'}`);
    }
    setTimeout(() => setCartMessage(''), 3000);
  };

  const handleAddToCartFromModal = (res) => {
    handleAddToCartResult(res);
    setQuickViewOpen(false);
  };

  // Handle quick view button click
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  // Calculate discount percentage if comparePrice exists
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  // Check if product can be added to cart
  const canAddToCart = product.stock?.status !== 'out_of_stock';

  // Get filtered specifications with icons and labels
  const getFilteredSpecifications = () => {
    if (!product.specifications) return [];
    
    return Object.entries(product.specifications)
      .filter(([key, value]) => {
        // Filter out empty values and graphics2 if it's the same as graphics
        if (!value || String(value).trim() === '') return false;
        if (key === 'graphics2' && value === product.specifications.graphics) return false;
        return true;
      })
      .slice(0, 4) // Limit to 4 specifications for compact display
      .map(([key, value]) => ({
        key,
        label: specificationLabels[key] || key,
        value: String(value),
        Icon: specificationIcons[key]
      }));
  };

  const filteredSpecs = getFilteredSpecifications();

  return (
    <>
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

          {/* Enhanced Specifications list with icons and bold labels */}
          {filteredSpecs.length > 0 && (
            <ul className="text-gray-600 text-xs mb-3 space-y-1.5">
              {filteredSpecs.map(({ key, label, value, Icon }) => (
                <li key={key} className="flex items-center gap-2 truncate">
                  {Icon && <Icon className="w-3 h-3 text-gray-400 shrink-0" />}
                  <span className="font-semibold text-gray-700 shrink-0">{label}:</span>
                  <span className="truncate text-gray-600">{value}</span>
                </li>
              ))}
            </ul>
          )}

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
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2 mt-3">
            {/* WhatsApp button */}
            <WhatsAppOrderButton
              label="WhatsApp"
              message={whatsappMessage}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-semibold rounded-lg"
              size="sm"
            />

            {/* Add to cart button (icon only) */}
            <AddToCartButton
              product={product}
              quantity={1}
              onResult={handleAddToCartResult}
              className={`px-3 py-2 ${addingToCart ? 'opacity-70 cursor-wait' : ''}`}
            />

            {/* Quick View button - Icon only with proper event handling */}
            <button
              onClick={handleQuickView}
              type="button"
              className="inline-flex items-center justify-center px-3 py-2 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors z-10"
              aria-label="Aperçu rapide"
              title="Aperçu rapide"
            >
              <FaEye className="w-4 h-4 text-gray-600" />
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

      {/* Quick View Modal - Outside the card to prevent Link conflicts */}
      {quickViewOpen && (
        <QuickViewModal
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
          product={product}
          onAddToCart={handleAddToCartFromModal}
        />
      )}
    </>
  );
}