'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { FaShoppingCart, FaSpinner } from 'react-icons/fa';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Cctv,
  Battery,
  Keyboard,
  Smartphone,
  Star
} from 'lucide-react';
import WhatsAppOrderButton from '@/components/store/WhatsAppOrderButton';
import AddToCartButton from '@/components/store/AddToCartButton';

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
          // Initialize quantity based on available stock
          const currentStock = data.product?.stock?.currentQuantity || 0;
          if (currentStock === 0) {
            setQuantity(0);
          }
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

  // Update quantity based on stock availability
  const updateQuantity = (newQuantity) => {
    if (!product) return;

    const currentStock = product.stock?.currentQuantity || 0;
    
    // Don't allow quantity less than 1 if product is in stock
    if (newQuantity < 1) {
      setQuantity(1);
      return;
    }

    // Don't allow quantity more than available stock
    if (newQuantity > currentStock) {
      setQuantity(currentStock);
      return;
    }

    setQuantity(newQuantity);
  };

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
  const handleAddToCartResult = (res) => {
    if (res?.success) {
      setCartMessage('✅ Produit ajouté au panier!');
    } else {
      setCartMessage(`❌ ${res?.error || 'Erreur lors de l\'ajout au panier'}`);
    }
    setTimeout(() => setCartMessage(''), 3000);
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
    graphics2: 'Carte Graphique (secondaire)',
    battery: 'Batterie',
    keyboard: 'Clavier',
    operatingSystem: 'Système d\'exploitation'
  };

  const specIcons = {
    processor: Cpu,
    ram: MemoryStick,
    storage: HardDrive,
    display: Monitor,
    graphics: Cctv,
    graphics2: Cctv,
    battery: Battery,
    keyboard: Keyboard,
    operatingSystem: Smartphone,
  };

  // Determine stock status
  const getStockStatus = () => {
    if (!product?.stock) return { text: 'Stock indisponible', color: 'text-red-600', bg: 'bg-red-100' };

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
    
    const currentStock = product.stock?.currentQuantity || 0;
    
    return (
      `Bonjour, je souhaite commander ce produit :\n` +
      `Nom: ${product.name}\n` +
      `Prix: ${product.price} MAD\n` +
      (product.comparePrice ? `Prix de comparaison: ${product.comparePrice} MAD\n` : '') +
      `Quantité en stock: ${currentStock}\n` +
      `Quantité demandée: ${quantity}\n` +
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
  const currentStock = product.stock?.currentQuantity || 0;
  const canAddToCart = product.stock?.status !== 'out_of_stock' && currentStock > 0;

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
              <Image
                width={600}
                height={600}
                loading="lazy"
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

              {/* Featured Badge */}
              {product.isFeatured && (
                <div className="absolute top-16 left-4 bg-yellow-400 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                  Populaire
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
                    <Image
                      width={80}
                      height={80}
                      loading="lazy"
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
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-4">
              {product?.brand && (
                <div>
                  {product.brand.logo ? (
                    <Image
                      width={40}
                      height={40}
                      loading="lazy"
                      src={product.brand.logo}
                      alt={product.brand.name}
                      className="w-12 sm:h-12 object-contain"
                      title={product.brand.name}
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-blue-200 text-xs font-semibold">
                      {product.brand.name}
                    </div>
                  )}
                </div>
              )}
              {product?.category && (
                <div className="bg-green-50 text-green-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-green-200 text-xs font-semibold">
                  {product.category.name}
                </div>
              )}
            </div>

            {/* Product Name */}
            <div>
              <h1 className="text-xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
                {product.name}
              </h1>
              {/* SKU Reference */}
              {product.sku && (
                <p className="text-[11px] text-gray-500">
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
                  onClick={() => updateQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                  className="px-3 lg:px-4 py-2 hover:bg-gray-50 transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="px-4 lg:px-6 py-2 border-x border-gray-300 font-medium min-w-[50px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(quantity + 1)}
                  disabled={quantity >= currentStock}
                  className="px-3 lg:px-4 py-2 hover:bg-gray-50 transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              {currentStock > 0 && (
                <span className="text-sm text-gray-500">
                  Maximum: {currentStock}
                </span>
              )}
            </div>

            {/* Stock Warning */}
            {currentStock === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm font-medium">
                  Ce produit est actuellement en rupture de stock.
                </p>
              </div>
            )}

            {currentStock > 0 && currentStock < 5 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-700 text-sm font-medium">
                  Stock faible! Seulement {currentStock} unité{currentStock > 1 ? 's' : ''} disponible{currentStock > 1 ? 's' : ''}.
                </p>
              </div>
            )}

            {/* Action Buttons - Side by side with content-based width */}
            <div className="flex flex-row flex-wrap gap-2 sm:gap-3">
              {/* WhatsApp Button */}
              <WhatsAppOrderButton
                label={canAddToCart ? "Commander via WhatsApp" : "Produit indisponible"}
                message={getWhatsAppMessage()}
                className={`flex-none text-xs sm:text-sm px-3 py-2 sm:px-5 sm:py-2.5 ${
                  canAddToCart 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!canAddToCart}
                size="sm"
              />
              
              {/* Add to Cart Button */}
              <AddToCartButton
                product={product}
                quantity={quantity}
                onResult={handleAddToCartResult}
                className={`flex-none text-xs sm:text-sm font-semibold rounded-lg px-3 py-2 sm:px-5 sm:py-2.5 ${
                  canAddToCart
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!canAddToCart}
              />
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
                {Object.entries(validSpecs).map(([key, value]) => {
                  const IconComponent = specIcons[key];
                  return (
                    <div key={key} className="flex items-start gap-4 border-b border-gray-200 pb-4 last:border-0">
                      {IconComponent && (
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg flex-shrink-0">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
                          {specLabels[key] || key}
                        </span>
                        <span className="text-base text-gray-900 font-medium">
                          {value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}