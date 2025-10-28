import { FaWhatsapp, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import { useState } from 'react';
import Link from 'next/link';

export default function ProductActions({ product }) {
  const [quantity, setQuantity] = useState(1);

  const handleWhatsAppOrder = () => {
    const message = `Bonjour! Je souhaite commander le produit suivant :%0A%0A*${product.name}*%0A*Prix :* ${product.price} MAD%0A*Quantité :* ${quantity}%0A*Référence :* ${product.sku || 'N/A'}%0A*Total :* ${product.price * quantity} MAD%0A%0APouvez-vous m'aider avec cette commande ?`;
    window.open(`https://wa.me/212771615622?text=${message}`, '_blank');
  };

  const handleAddToCart = () => {
    // Fonction statique pour l'instant - à implémenter plus tard
    alert(`Produit "${product.name}" ajouté au panier (fonctionnalité à venir)`);
    // Ici vous pourrez ajouter la logique du panier plus tard
  };

  const isOutOfStock = !product.stock || product.stock.status === 'out_of_stock';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Sélecteur de quantité */}
      {!isOutOfStock && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantité
          </label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              -
            </button>
            <span className="w-12 text-center text-lg font-semibold text-gray-900">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              disabled={product.stock && quantity >= product.stock.currentQuantity}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
            {product.stock && (
              <span className="text-sm text-gray-500 ml-2">
                {product.stock.currentQuantity} disponible(s)
              </span>
            )}
          </div>
          
          {/* Total calculé */}
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Total :</span>
              <span className="text-lg font-bold text-blue-700">
                {product.price * quantity} MAD
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Boutons d'action principaux */}
      <div className="space-y-3">
        {/* Commander via WhatsApp */}
        <button
          onClick={handleWhatsAppOrder}
          disabled={isOutOfStock}
          className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
        >
          <FaWhatsapp className="w-6 h-6" />
          <span>Commander via WhatsApp</span>
        </button>

        {/* Ajouter au panier (statique) */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold text-lg border-2 transition-all duration-200 ${
            isOutOfStock
              ? 'border-gray-300 text-gray-500 cursor-not-allowed'
              : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transform hover:-translate-y-0.5'
          }`}
        >
          <FaShoppingCart className="w-5 h-5" />
          <span>Ajouter au panier</span>
        </button>

        {/* Commander maintenant (redirection) */}
        <Link
          href={{
            pathname: '/order',
            query: { 
              product: product.slug,
              quantity: quantity
            }
          }}
          className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold text-lg border-2 transition-all duration-200 ${
            isOutOfStock
              ? 'border-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
              : 'border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transform hover:-translate-y-0.5'
          }`}
        >
          <FaCreditCard className="w-5 h-5" />
          <span>Commander maintenant</span>
        </Link>
      </div>

      {/* Informations de stock */}
      {isOutOfStock && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-700 font-medium">Produit actuellement en rupture de stock</p>
          <p className="text-red-600 text-sm mt-1">Contactez-nous pour la disponibilité</p>
        </div>
      )}

      {/* Garanties rapides */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div className="text-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <FaWhatsapp className="w-4 h-4 text-green-600" />
            </div>
            <span>Réponse rapide</span>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
              <FaCreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <span>Paiement sécurisé</span>
          </div>
        </div>
      </div>
    </div>
  );
}