import { useState, useEffect } from 'react';

export default function ProductFilters({
  categories,
  brands,
  filters,
  onFilterChange,
  onClearFilters,
  productCount,
  totalProductCount
}) {
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || '',
    max: filters.maxPrice || ''
  });

  // Synchroniser priceRange avec les filtres
  useEffect(() => {
    setPriceRange({
      min: filters.minPrice || '',
      max: filters.maxPrice || ''
    });
  }, [filters.minPrice, filters.maxPrice]);

  const handlePriceChange = (type, value) => {
    const newPriceRange = {
      ...priceRange,
      [type]: value
    };
    setPriceRange(newPriceRange);
    
    onFilterChange('minPrice', newPriceRange.min);
    onFilterChange('maxPrice', newPriceRange.max);
  };

  const hasActiveFilters = filters.category || filters.brand || filters.minPrice || filters.maxPrice;

  // Trouver la catégorie sélectionnée pour l'affichage
  const selectedCategory = categories.find(cat => cat._id === filters.category);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8 filters-sidebar">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
        <button
          onClick={onClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Tout effacer
        </button>
      </div>

      {/* Indicateur de catégorie sélectionnée depuis le header */}
      {selectedCategory && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800 mb-1">
            Catégorie sélectionnée
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700">{selectedCategory.name}</span>
            <button
              onClick={() => onFilterChange('category', '')}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Filtre Catégorie */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Catégorie</h3>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">Toutes les catégories</option>
          {categories
            .filter(cat => cat.isActive)
            .map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))
          }
        </select>
      </div>

      {/* Filtre Marque */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Marque</h3>
        <select
          value={filters.brand}
          onChange={(e) => onFilterChange('brand', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">Toutes les marques</option>
          {brands
            .filter(brand => brand.isActive)
            .map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))
          }
        </select>
      </div>

      {/* Filtre Fourchette de Prix */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Fourchette de Prix</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Prix minimum (MAD)</label>
            <input
              type="number"
              placeholder="0"
              value={priceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Prix maximum (MAD)</label>
            <input
              type="number"
              placeholder="10000"
              value={priceRange.max}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Résumé des filtres actifs */}
      {hasActiveFilters && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-800 mb-1">
            {productCount} produit{productCount > 1 ? 's' : ''} trouvé{productCount > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-blue-600">
            Sur {totalProductCount} produit{totalProductCount > 1 ? 's' : ''} au total
          </p>
        </div>
      )}
    </div>
  );
}