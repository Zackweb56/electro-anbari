"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from 'next/image';
import { 
  X, 
  ChevronLeft, 
  ChevronRight,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Tag,
  Cpu,
  MemoryStick,
  HardDrive,
  Monitor,
  Cctv,
  Battery,
  Keyboard,
  Smartphone,
} from "lucide-react";
import WhatsAppOrderButton from "./WhatsAppOrderButton";
import AddToCartButton from "./AddToCartButton";

export default function QuickViewModal({
  open,
  onOpenChange,
  product,
  onAddToCart,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const images = [
    ...(product?.mainImage ? [product.mainImage] : []),
    ...((product?.images || []).filter((img) => img && img !== product.mainImage)),
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasDiscount = product?.comparePrice && product.comparePrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  const getStockStatus = () => {
    if (!product?.stock)
      return {
        text: "Indisponible",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        icon: XCircle,
        available: false,
      };

    const { currentQuantity, status } = product.stock;
    switch (status) {
      case "out_of_stock":
        return {
          text: "Rupture de stock",
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          icon: XCircle,
          available: false,
        };
      case "low_stock":
        return {
          text: `Stock faible (${currentQuantity})`,
          color: "text-orange-600",
          bg: "bg-orange-50",
          border: "border-orange-200",
          icon: AlertTriangle,
          available: true,
        };
      case "in_stock":
        return {
          text: `En stock (${currentQuantity})`,
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
          icon: CheckCircle,
          available: true,
        };
      default:
        return {
          text: "Indisponible",
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          icon: XCircle,
          available: false,
        };
    }
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  const specificationConfig = {
    processor: { icon: Cpu, label: "Processeur" },
    ram: { icon: MemoryStick, label: "RAM" },
    storage: { icon: HardDrive, label: "Stockage" },
    display: { icon: Monitor, label: "Écran" },
    graphics: { icon: Cctv, label: "Carte graphique" },
    graphics2: { icon: Cctv, label: "Graphique secondaire" },
    battery: { icon: Battery, label: "Batterie" },
    keyboard: { icon: Keyboard, label: "Clavier" },
    operatingSystem: { icon: Smartphone, label: "Système" },
  };

  const validSpecifications = Object.entries(product?.specifications || {})
    .filter(([key, value]) => value && value.trim() !== "")
    .map(([key, value]) => ({
      key,
      label: specificationConfig[key]?.label || key,
      value,
      icon: specificationConfig[key]?.icon,
    }));

  const whatsappMessage =
    `Bonjour, je souhaite commander ce produit :\n` +
    `📱 *${product?.name}*\n` +
    `💰 Prix: ${product?.price} MAD\n` +
    (hasDiscount
      ? `🎯 Ancien prix: ${product.comparePrice} MAD (-${discountPercentage}%)\n`
      : "") +
    (product?.stock
      ? `📦 Stock: ${product.stock.currentQuantity} unité(s)\n`
      : "") +
    `🔗 Lien: ${typeof window !== "undefined" ? `${window.location.origin}/product/${product?.slug}` : ""}`;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] h-full sm:h-[85vh] overflow-hidden flex flex-col lg:flex-row animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side - Image Slider */}
        <div className="lg:w-[45%] bg-gradient-to-br from-gray-50 to-gray-100 relative flex items-center justify-center p-3 sm:p-8 min-h-[200px] sm:min-h-0">
          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-white/90 hover:bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

          {/* Image Display */}
          <div className="relative w-full h-full flex items-center justify-center">
            {images.length > 0 && images[currentImageIndex] ? (
              <Image
                width={500}
                height={500}
                src={images[currentImageIndex]}
                alt={product?.name || "Image produit"}
                className="max-h-[180px] sm:max-h-[400px] max-w-full object-contain drop-shadow-2xl"
              />
            ) : (
              <div className="text-gray-400 text-center">
                <XCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" />
                <span className="text-xs sm:text-sm">Image non disponible</span>
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-5 sm:h-5 text-gray-700" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:scale-110"
                >
                  <ChevronRight className="w-3 h-3 sm:w-5 sm:h-5 text-gray-700" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}

            {/* Badges */}
            {hasDiscount && (
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg">
                -{discountPercentage}%
              </div>
            )}

            {product?.isFeatured && (
              <div className="absolute top-2 sm:top-4 right-10 sm:right-16 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                <Star className="w-2 h-2 sm:w-3 sm:h-3 fill-current" /> Populaire
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Scrollable Content */}
        <div className="lg:w-[55%] flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="p-3 sm:p-6 border-b border-gray-100">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2">
              {product?.name}
            </h1>

            {/* Brand / Category */}
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-4">
              {product?.brand && (
                <div>
                  {product.brand.logo ? (
                    <Image
                      width={40}
                      height={40}
                      src={product.brand.logo}
                      alt={product.brand.name}
                      className="w-6 h-6 sm:w-12 sm:h-12 object-contain"
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

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-xl sm:text-3xl font-bold text-gray-900">
                {product?.price} MAD
              </span>
              {hasDiscount && (
                <span className="text-sm sm:text-lg text-gray-400 line-through">
                  {product?.comparePrice} MAD
                </span>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-2 sm:py-4 space-y-3 sm:space-y-5">
            {/* Stock Status */}
            <div
              className={`flex items-center gap-2 p-2 sm:p-3.5 rounded-xl border ${stockStatus.bg} ${stockStatus.border}`}
            >
              <StockIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${stockStatus.color}`} />
              <div>
                <p className={`font-semibold text-xs sm:text-sm ${stockStatus.color}`}>
                  {stockStatus.text}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {stockStatus.available
                    ? "Prêt pour la livraison"
                    : "Produit non disponible"}
                </p>
              </div>
            </div>

            {/* Description */}
            {product?.description && (
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 sm:mb-2 uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-4 sm:line-clamp-none">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications */}
            {validSpecifications.length > 0 && (
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3 uppercase tracking-wide">
                  Configurations
                </h3>
                <div className="space-y-1 sm:space-y-2">
                  {validSpecifications.map(({ key, label, value, icon: Icon }) => (
                    <div
                      key={key}
                      className="flex items-start gap-2 p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      {Icon && (
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="block font-semibold text-gray-700 text-xs mb-0.5">
                          {label}
                        </span>
                        <span className="text-gray-600 text-xs sm:text-sm">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {product?.features?.length > 0 && (
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3 uppercase tracking-wide">
                  Caractéristiques
                </h3>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {product.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 border border-blue-200 text-xs py-1 px-2 font-medium rounded-md"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SKU */}
            {product?.sku && (
              <div className="text-gray-500 text-xs pt-1 sm:pt-2 border-t border-gray-100">
                <span className="font-semibold">Référence:</span> {product.sku}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3 sm:p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-end gap-2 sm:gap-3">
              <WhatsAppOrderButton
                label="WhatsApp"
                message={whatsappMessage}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm shadow-sm hover:shadow"
              />
              <AddToCartButton
                product={product}
                quantity={1}
                onResult={onAddToCart}
                className={`px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-lg ${
                  stockStatus.available
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render at the document root level
  return createPortal(modalContent, document.body);
}