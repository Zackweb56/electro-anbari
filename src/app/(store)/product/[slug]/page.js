'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaShoppingCart, FaSpinner } from 'react-icons/fa';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import WhatsAppOrderButton from '@/components/store/WhatsAppOrderButton';

// Cart utilities
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

export default function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const params = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/products/${params.slug}`);
        const data = await response.json();
        
        if (data.success) {
          setProduct(data.product);
        } else {
          setError(data.error || 'Produit non trouvé');
        }
      } catch (error) {
        setError('Erreur lors du chargement du produit');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const nextImage = () => {
    setSelectedImage((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImage((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

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
      const result = await cartUtils.addToCart(product, quantity);
      
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

  // Filter out empty specifications
  const getValidSpecs = (specs) => {
    if (!specs) return {};
    return Object.entries(specs).reduce((acc, [key, value]) => {
      if (value && value.trim() !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
  };

  const specLabels = {
    processor: 'Processeur',
    ram: 'Mémoire RAM',
    storage: 'Stockage',
    display: 'Écran',
    graphics: 'Carte Graphique',
    operatingSystem: 'Système d\'exploitation'
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

  // Generate WhatsApp message
  const getWhatsAppMessage = () => {
    if (!product) return '';
    
    return (
      `Bonjour, je souhaite commander ce produit :\n` +
      `Nom: ${product.name}\n` +
      `Prix: ${product.price} MAD\n` +
      (product.comparePrice ? `Prix de comparaison: ${product.comparePrice} MAD\n` : '') +
      (product.stock && product.stock.currentQuantity !== undefined ? `Quantité en stock: ${product.stock.currentQuantity}\n` : '') +
      `Quantité: ${quantity}\n` +
      `Lien produit: ${typeof window !== 'undefined' ? window.location.href : ''}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit non trouvé</h2>
          <p className="text-gray-600 mb-6">{error || 'Le produit demandé n\'existe pas.'}</p>
          <Link
            href="/store"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.mainImage];
  const validSpecs = getValidSpecs(product.specifications);
  const hasSpecs = Object.keys(validSpecs).length > 0;
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;
  const stockStatus = getStockStatus();
  const canAddToCart = product.stock?.status !== 'out_of_stock';

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/home" className="text-gray-500 hover:text-gray-900 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/store" className="text-gray-500 hover:text-gray-900 transition-colors">
              Boutique
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16">
          {/* Left Column - Image Gallery */}
          <div className="space-y-4">
            {/* Main Image with Zoom */}
            <div 
              className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden cursor-crosshair"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={images[selectedImage] || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-contain p-8 transition-transform duration-200"
                style={isZoomed ? {
                  transform: 'scale(2)',
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                } : {}}
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-900" />
                  </button>
                </>
              )}

              {/* Stock Badge */}
              <span className={`absolute top-4 left-4 text-xs font-medium px-3 py-1.5 rounded-full ${stockStatus.color} ${stockStatus.bg}`}>
                {stockStatus.text}
              </span>

              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-blue-600 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain p-2 bg-gray-50"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-4 lg:space-y-6">
            {/* Brand & Category */}
            <div className="flex items-center gap-3 text-sm">
              {product.brand?.name && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                  {product.brand.name}
                </span>
              )}
              {product.category?.name && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                  {product.category.name}
                </span>
              )}
            </div>

            {/* Product Name */}
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
                {product.name}
              </h1>
              {/* SKU Reference */}
              {product.sku && (
                <p className="text-sm text-gray-500">
                  Référence: <span className="font-mono font-medium text-gray-700">{product.sku}</span>
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                {product.price.toLocaleString('fr-FR')} DH
              </span>
              {product.comparePrice && (
                <span className="text-lg lg:text-xl text-gray-400 line-through">
                  {product.comparePrice.toLocaleString('fr-FR')} DH
                </span>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 lg:p-6 space-y-2 lg:space-y-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm lg:text-base text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Quantité:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 lg:px-4 py-2 hover:bg-gray-50 transition-colors text-lg font-medium"
                >
                  -
                </button>
                <span className="px-4 lg:px-6 py-2 border-x border-gray-300 font-medium min-w-[50px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 lg:px-4 py-2 hover:bg-gray-50 transition-colors text-lg font-medium"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {/* WhatsApp Button - Primary */}
              <WhatsAppOrderButton
                label="Commander via WhatsApp"
                message={getWhatsAppMessage()}
                className="flex-1"
                size="lg"
              />
              
              {/* Add to Cart Button - Icon Only */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !canAddToCart}
                className={`p-3 lg:p-4 rounded-xl font-semibold transition-colors shadow-lg ${
                  canAddToCart
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed shadow-gray-400/30'
                } ${addingToCart ? 'opacity-70 cursor-wait' : ''}`}
                title={canAddToCart ? "Ajouter au panier" : "Produit en rupture de stock"}
              >
                {addingToCart ? (
                  <FaSpinner className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" />
                ) : (
                  <FaShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                )}
              </button>
            </div>

            {/* Cart Message */}
            {cartMessage && (
              <div className={`text-xs lg:text-sm text-center p-2 lg:p-3 rounded-lg transition-all duration-300 ${
                cartMessage.includes('✅') 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {cartMessage}
              </div>
            )}
          </div>
        </div>

        {/* Specifications Section - Only show if there are valid specs */}
        {hasSpecs && (
          <div className="mt-12 lg:mt-16">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">
              Spécifications Techniques
            </h2>
            <div className="bg-gray-50 rounded-2xl p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {Object.entries(validSpecs).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-4 last:border-0">
                    <span className="text-xs lg:text-sm font-semibold text-gray-600 uppercase tracking-wide sm:w-48 mb-1 sm:mb-0">
                      {specLabels[key] || key}
                    </span>
                    <span className="text-sm lg:text-base text-gray-900 font-medium">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}