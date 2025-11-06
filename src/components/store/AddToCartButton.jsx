"use client";

import { useState } from 'react';
import { FaShoppingCart, FaSpinner } from 'react-icons/fa';
import { cartUtils } from '@/lib/cart';

export default function AddToCartButton({ 
  product, 
  quantity = 1, 
  className = '', 
  disabled: disabledProp,
  title,
  onResult,
}) {
  const [loading, setLoading] = useState(false);

  const isOutOfStock = product?.stock?.status === 'out_of_stock';
  const disabled = (disabledProp ?? isOutOfStock) || loading;
  const btnTitle = title || (isOutOfStock ? 'Produit en rupture de stock' : 'Ajouter au panier');

  const handleClick = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (disabled) return;
    setLoading(true);
    try {
      const result = await cartUtils.addToCart(product, quantity);
      if (result.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cartUpdated'));
        }
        onResult?.({ success: true });
      } else {
        onResult?.({ success: false, error: result.error });
      }
    } catch (error) {
      onResult?.({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg transition-colors ${
        disabled ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
      } ${className}`}
      title={btnTitle}
      aria-label={btnTitle}
    >
      {loading ? (
        <FaSpinner className="w-4 h-4 animate-spin" />
      ) : (
        <FaShoppingCart className="w-4 h-4" />
      )}
    </button>
  );
}