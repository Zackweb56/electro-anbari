import { FaStar, FaShippingFast, FaShieldAlt, FaRecycle } from 'react-icons/fa';

export default function ProductInfo({ product }) {
  const getStockStatus = () => {
    if (!product.stock) return { 
      text: 'Indisponible', 
      color: 'text-red-600', 
      bg: 'bg-red-100',
      border: 'border-red-200'
    };
    
    const { currentQuantity, status } = product.stock;
    
    switch (status) {
      case 'out_of_stock':
        return { 
          text: 'Rupture de stock', 
          color: 'text-red-600', 
          bg: 'bg-red-100',
          border: 'border-red-200'
        };
      case 'low_stock':
        return { 
          text: `Stock faible (${currentQuantity} restants)`, 
          color: 'text-orange-600', 
          bg: 'bg-orange-100',
          border: 'border-orange-200'
        };
      case 'in_stock':
        return { 
          text: 'En stock', 
          color: 'text-green-600', 
          bg: 'bg-green-100',
          border: 'border-green-200'
        };
      default:
        return { 
          text: 'Indisponible', 
          color: 'text-red-600', 
          bg: 'bg-red-100',
          border: 'border-red-200'
        };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* En-tête */}
      <div className="mb-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color} ${stockStatus.border} border`}>
            {stockStatus.text}
          </span>
          {product.isFeatured && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              <FaStar className="w-3 h-3 mr-1" />
              Populaire
            </span>
          )}
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
        
        {/* SKU */}
        {product.sku && (
          <p className="text-gray-500 text-sm mb-4">Référence: {product.sku}</p>
        )}
      </div>

      {/* Prix */}
      <div className="mb-6">
        <div className="flex items-baseline space-x-3">
          <span className="text-4xl font-bold text-gray-900">{product.price} MAD</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <>
              <span className="text-2xl text-gray-500 line-through">{product.comparePrice} MAD</span>
              <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                -{Math.round((1 - product.price / product.comparePrice) * 100)}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
        <p className="text-gray-700 leading-relaxed">{product.description}</p>
      </div>

      {/* Caractéristiques */}
      {product.features && product.features.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Caractéristiques</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {product.features.map((feature, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Catégorie et Marque */}
      <div className="flex flex-wrap gap-4 mb-6">
        {product.category && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">Catégorie</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {product.category.name}
            </span>
          </div>
        )}
        {product.brand && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">Marque</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {product.brand.name}
            </span>
          </div>
        )}
      </div>

      {/* Garanties */}
      <div className="border-t border-gray-200 pt-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <FaShippingFast className="w-4 h-4 text-green-500" />
            <span>Livraison rapide</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <FaShieldAlt className="w-4 h-4 text-blue-500" />
            <span>Garantie incluse</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <FaRecycle className="w-4 h-4 text-orange-500" />
            <span>Retours faciles</span>
          </div>
        </div>
      </div>
    </div>
  );
}